import { NextRequest, NextResponse } from "next/server";
import { getHeadToHead } from "@/lib/db/repository";

export async function GET(request: NextRequest) {
  const teamA = request.nextUrl.searchParams.get("teamA");
  const teamB = request.nextUrl.searchParams.get("teamB");

  if (!teamA || !teamB) {
    return NextResponse.json({ error: "Query parameters 'teamA' and 'teamB' are required." }, { status: 400 });
  }

  const items = await getHeadToHead(teamA, teamB);

  return NextResponse.json({
    items
  });
}
