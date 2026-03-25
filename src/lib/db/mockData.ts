import { Match, StandingRow, Team } from "@/lib/types/competition";

export const teams: Team[] = [
  { slug: "cn-ginastica", name: "C.N. Ginastica" },
  { slug: "cv-oeiras", name: "CV Oeiras" },
  { slug: "esmoriz-gc", name: "Esmoriz GC" },
  { slug: "vc-viana", name: "VC Viana" },
  { slug: "sc-caldas", name: "SC Caldas" },
  { slug: "gdc-gueifaes", name: "GDC Gueifaes" }
];

export const matches: Match[] = [
  {
    id: "m-2026-03-21-cng-esm",
    competitionId: 130,
    phase: "2a Fase - Prim.",
    matchDateIso: "2026-03-21T18:00:00+00:00",
    homeTeam: "C.N. Ginastica",
    awayTeam: "Esmoriz GC",
    homeSets: 1,
    awaySets: 3,
    status: "finished"
  },
  {
    id: "m-2026-03-28-mac-esm",
    competitionId: 130,
    phase: "2a Fase - Prim.",
    matchDateIso: "2026-03-28T17:00:00+00:00",
    homeTeam: "AD Machico",
    awayTeam: "Esmoriz GC",
    homeSets: null,
    awaySets: null,
    status: "scheduled"
  },
  {
    id: "m-2026-03-28-oei-gin",
    competitionId: 130,
    phase: "2a Fase - Prim.",
    matchDateIso: "2026-03-28T17:00:00+00:00",
    homeTeam: "CV Oeiras",
    awayTeam: "C.N. Ginastica",
    homeSets: null,
    awaySets: null,
    status: "scheduled"
  }
];

export const standings: StandingRow[] = [
  {
    phase: "2a Fase - Prim.",
    rank: 1,
    team: "VC Viana",
    points: 12,
    played: 5,
    won: 4,
    lost: 1,
    setsWon: 13,
    setsLost: 5
  },
  {
    phase: "2a Fase - Prim.",
    rank: 2,
    team: "CV Oeiras",
    points: 12,
    played: 5,
    won: 4,
    lost: 1,
    setsWon: 12,
    setsLost: 6
  },
  {
    phase: "2a Fase - Prim.",
    rank: 3,
    team: "C.N. Ginastica",
    points: 9,
    played: 5,
    won: 3,
    lost: 2,
    setsWon: 11,
    setsLost: 6
  },
  {
    phase: "2a Fase - Prim.",
    rank: 4,
    team: "Esmoriz GC",
    points: 9,
    played: 5,
    won: 3,
    lost: 2,
    setsWon: 11,
    setsLost: 7
  }
];
