import {
  getMatches,
  getStandings,
  insertScraperRun,
  replaceStandingsSnapshot,
  upsertMatches
} from "@/lib/db/repository";
import { detectMatchChanges, detectStandingsChanges } from "@/lib/etl/diff";
import { notifyMatchStartingSoon, notifyResultPublished } from "@/lib/notifications/push";
import { parseFpvCompetition, scrapeFpvCompetitionHtml } from "@/lib/scrapers/fpv";
import { standings as mockStandings } from "@/lib/db/mockData";

export interface RunSyncSummary {
  fetchedAtIso: string;
  fetchedMatches: number;
  fetchedStandings: number;
  appliedStandings: number;
  standingsFallbackUsed: boolean;
  upsertedMatches: number;
  upsertedStandings: number;
  changesDetected: number;
  startNotifications: number;
  resultNotifications: number;
}

export async function runCompetitionSync(): Promise<RunSyncSummary> {
  const previousMatches = await getMatches();
  const previousStandings = await getStandings();

  const html = await scrapeFpvCompetitionHtml();
  const snapshot = parseFpvCompetition(html);

  const changedMatches = detectMatchChanges(previousMatches, snapshot.matches);
  const effectiveStandings =
    snapshot.standings.length > 0
      ? snapshot.standings
      : previousStandings.length > 0
        ? previousStandings
        : mockStandings;

  const changedStandings = detectStandingsChanges(previousStandings, effectiveStandings);

  const upsertedMatches = await upsertMatches(snapshot.matches);
  const upsertedStandings = await replaceStandingsSnapshot(effectiveStandings);

  const nowMs = Date.now();
  let startNotifications = 0;
  let resultNotifications = 0;

  for (const match of snapshot.matches) {
    const startDiffMs = new Date(match.matchDateIso).getTime() - nowMs;
    const startsSoon = startDiffMs <= 15 * 60 * 1000 && startDiffMs >= -5 * 60 * 1000;
    if (match.status === "scheduled" && startsSoon) {
      const sent = await notifyMatchStartingSoon(match);
      if (sent) {
        startNotifications += 1;
      }
    }
  }

  for (const match of changedMatches) {
    if (match.status === "finished" && match.homeSets !== null && match.awaySets !== null) {
      const sent = await notifyResultPublished(match);
      if (sent) {
        resultNotifications += 1;
      }
    }
  }

  const details: RunSyncSummary = {
    fetchedAtIso: snapshot.fetchedAtIso,
    fetchedMatches: snapshot.matches.length,
    fetchedStandings: snapshot.standings.length,
    appliedStandings: effectiveStandings.length,
    standingsFallbackUsed: snapshot.standings.length === 0,
    upsertedMatches,
    upsertedStandings,
    changesDetected: changedMatches.length + changedStandings.length,
    startNotifications,
    resultNotifications
  };

  await insertScraperRun("fpv", true, details);
  return details;
}

export async function runCompetitionSyncSafe(): Promise<{ ok: true; summary: RunSyncSummary } | { ok: false; error: string }> {
  try {
    const summary = await runCompetitionSync();
    return { ok: true, summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await insertScraperRun("fpv", false, { error: message });
    return { ok: false, error: message };
  }
}
