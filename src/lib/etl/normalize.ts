import { Match, StandingRow } from "@/lib/types/competition";

export function normalizeTeamName(rawName: string): string {
  return rawName.replace(/\s+/g, " ").trim();
}

export function normalizeMatch(match: Match): Match {
  return {
    ...match,
    homeTeam: normalizeTeamName(match.homeTeam),
    awayTeam: normalizeTeamName(match.awayTeam)
  };
}

export function normalizeStanding(row: StandingRow): StandingRow {
  return {
    ...row,
    team: normalizeTeamName(row.team)
  };
}
