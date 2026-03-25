import { NextRequest, NextResponse } from "next/server";
import { runCompetitionSyncSafe } from "@/lib/sync/runSync";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const tokenFromHeader = request.headers.get("x-cron-token");
  const tokenFromQuery = request.nextUrl.searchParams.get("token");
  return tokenFromHeader === secret || tokenFromQuery === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
