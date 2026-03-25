import { Match, StandingRow } from "@/lib/types/competition";

export function detectMatchChanges(previous: Match[], nextData: Match[]): Match[] {
  const previousMap = new Map(previous.map((m) => [m.id, m]));
  return nextData.filter((current) => {
    const old = previousMap.get(current.id);
    if (!old) {
      return true;
    }

    return (
      old.status !== current.status ||
      old.homeSets !== current.homeSets ||
      old.awaySets !== current.awaySets ||
      old.matchDateIso !== current.matchDateIso
    );
  });
}

export function detectStandingsChanges(previous: StandingRow[], nextData: StandingRow[]): StandingRow[] {
  const previousKey = (r: StandingRow) => `${r.phase}:${r.team}`;
  const previousMap = new Map(previous.map((row) => [previousKey(row), row]));

  return nextData.filter((current) => {
    const old = previousMap.get(previousKey(current));
    if (!old) {
      return true;
    }

    return old.rank !== current.rank || old.points !== current.points || old.setsWon !== current.setsWon || old.setsLost !== current.setsLost;
  });
}
