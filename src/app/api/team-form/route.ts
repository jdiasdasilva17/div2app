import { NextRequest, NextResponse } from "next/server";
import { getTeamForm } from "@/lib/db/repository";

export async function GET(request: NextRequest) {
  const team = request.nextUrl.searchParams.get("team");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "5");

  if (!team) {
    return NextResponse.json({ error: "Query parameter 'team' is required." }, { status: 400 });
  }

  const items = await getTeamForm(team, Number.isNaN(limit) ? 5 : limit);

  return NextResponse.json({
    items
  });
}
