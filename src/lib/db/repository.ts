import { matches, standings, teams } from "@/lib/db/mockData";
import { isSupabaseConfigured, supabaseRest } from "@/lib/db/supabase";
import { Match, StandingRow, Team } from "@/lib/types/competition";

interface SupabaseMatchRow {
  id: string;
  competition_id: number;
  phase: string;
  match_date: string;
  home_team: string;
  away_team: string;
  home_sets: number | null;
  away_sets: number | null;
  status: "scheduled" | "finished";
}

interface SupabaseStandingRow {
  phase: string;
  rank: number;
  team: string;
  points: number;
  played: number;
  won: number;
  lost: number;
  sets_won: number;
  sets_lost: number;
  fetched_at: string;
}

const memoryNotificationEventKeys = new Set<string>();

function mapMatchRow(row: SupabaseMatchRow): Match {
  return {
    id: row.id,
    competitionId: row.competition_id,
    phase: row.phase,
    matchDateIso: row.match_date,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeSets: row.home_sets,
    awaySets: row.away_sets,
    status: row.status
  };
}

function mapStandingRow(row: SupabaseStandingRow): StandingRow {
  return {
    phase: row.phase,
    rank: row.rank,
    team: row.team,
    points: row.points,
    played: row.played,
    won: row.won,
    lost: row.lost,
    setsWon: row.sets_won,
    setsLost: row.sets_lost
  };
}

export async function getTeams(): Promise<Team[]> {
  return teams;
}

export async function getMatches(): Promise<Match[]> {
  if (!isSupabaseConfigured()) {
    return [...matches].sort((a, b) => a.matchDateIso.localeCompare(b.matchDateIso));
  }

  try {
    const rows = await supabaseRest<SupabaseMatchRow[]>(
      "matches?select=id,competition_id,phase,match_date,home_team,away_team,home_sets,away_sets,status&order=match_date.asc"
    );
    return rows.map(mapMatchRow);
  } catch {
    return [...matches].sort((a, b) => a.matchDateIso.localeCompare(b.matchDateIso));
  }
}

export async function getStandings(phase?: string): Promise<StandingRow[]> {
  if (!isSupabaseConfigured()) {
    const data = phase ? standings.filter((row) => row.phase === phase) : standings;
    return [...data].sort((a, b) => a.rank - b.rank);
  }

  try {
    const phaseFilter = phase ? `&phase=eq.${encodeURIComponent(phase)}` : "";
    const rows = await supabaseRest<SupabaseStandingRow[]>(
      `standings_rows?select=phase,rank,team,points,played,won,lost,sets_won,sets_lost,fetched_at&order=fetched_at.desc&order=rank.asc${phaseFilter}`
    );

    if (rows.length === 0) {
      return [];
    }

    const latestFetchedAt = rows[0].fetched_at;
    return rows
      .filter((row) => row.fetched_at === latestFetchedAt)
      .map(mapStandingRow)
      .sort((a, b) => a.rank - b.rank);
  } catch {
    const data = phase ? standings.filter((row) => row.phase === phase) : standings;
    return [...data].sort((a, b) => a.rank - b.rank);
  }
}

export async function getTeamForm(teamName: string, limit = 5): Promise<Match[]> {
  const teamMatches = (await getMatches())
    .filter((m) => m.status === "finished" && (m.homeTeam === teamName || m.awayTeam === teamName))
    .sort((a, b) => b.matchDateIso.localeCompare(a.matchDateIso));

  return teamMatches.slice(0, limit);
}

export async function getHeadToHead(teamA: string, teamB: string): Promise<Match[]> {
  return (await getMatches()).filter(
    (m) =>
      (m.homeTeam === teamA && m.awayTeam === teamB) ||
      (m.homeTeam === teamB && m.awayTeam === teamA)
  );
}

export async function upsertMatches(items: Match[]): Promise<number> {
  if (items.length === 0) {
    return 0;
  }

  if (!isSupabaseConfigured()) {
    return items.length;
  }

  const payload = items.map((item) => ({
    id: item.id,
    competition_id: item.competitionId,
    phase: item.phase,
    match_date: item.matchDateIso,
    home_team: item.homeTeam,
    away_team: item.awayTeam,
    home_sets: item.homeSets,
    away_sets: item.awaySets,
    status: item.status,
    source: "fpv"
  }));

  await supabaseRest<SupabaseMatchRow[]>("matches?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(payload)
  });

  return items.length;
}

export async function replaceStandingsSnapshot(items: StandingRow[]): Promise<number> {
  if (items.length === 0) {
    return 0;
  }

  if (!isSupabaseConfigured()) {
    return items.length;
  }

  const fetchedAt = new Date().toISOString();
  const payload = items.map((item) => ({
    phase: item.phase,
    rank: item.rank,
    team: item.team,
    points: item.points,
    played: item.played,
    won: item.won,
    lost: item.lost,
    sets_won: item.setsWon,
    sets_lost: item.setsLost,
    fetched_at: fetchedAt
  }));

  await supabaseRest<SupabaseStandingRow[]>("standings_rows", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return items.length;
}

export async function insertScraperRun(source: string, ok: boolean, details: unknown): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  await supabaseRest("scraper_runs", {
    method: "POST",
    body: JSON.stringify([
      {
        source,
        ok,
        details
      }
    ])
  });
}

export async function hasNotificationEvent(eventKey: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return memoryNotificationEventKeys.has(eventKey);
  }

  const rows = await supabaseRest<Array<{ event_key: string }>>(
    `notification_events?select=event_key&event_key=eq.${encodeURIComponent(eventKey)}&limit=1`
  );

  return rows.length > 0;
}

export async function createNotificationEvent(
  eventKey: string,
  eventType: string,
  matchId?: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    memoryNotificationEventKeys.add(eventKey);
    return;
  }

  await supabaseRest("notification_events?on_conflict=event_key", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify([
      {
        event_key: eventKey,
        event_type: eventType,
        match_id: matchId ?? null
      }
    ])
  });
}
