import { NextResponse } from "next/server";
import { runCompetitionSyncSafe } from "@/lib/sync/runSync";

export async function POST() {
  const result = await runCompetitionSyncSafe();
  if (!result.ok) {
    return NextResponse.json(
      {
        error: "Sync failed",
        details: result.error
      },
      { status: 500 }
    );
  }

  return NextResponse.json(result.summary);
}
