import { runCompetitionSyncSafe } from "@/lib/sync/runSync";

runCompetitionSyncSafe()
  .then((result) => {
    if (!result.ok) {
      console.error("Sync failed", result.error);
      process.exitCode = 1;
      return;
    }

    console.log("Sync completed", result.summary);
  });
