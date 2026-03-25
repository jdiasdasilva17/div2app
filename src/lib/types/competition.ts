export type MatchStatus = "scheduled" | "finished";

export interface Team {
  slug: string;
  name: string;
}

export interface Match {
  id: string;
  competitionId: number;
  phase: string;
  matchDateIso: string;
  homeTeam: string;
  awayTeam: string;
  homeSets: number | null;
  awaySets: number | null;
  status: MatchStatus;
}

export interface StandingRow {
  phase: string;
  rank: number;
  team: string;
  points: number;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
}

export interface SyncSummary {
  fetchedAtIso: string;
  matchesUpserted: number;
  standingsUpserted: number;
  changesDetected: number;
}
