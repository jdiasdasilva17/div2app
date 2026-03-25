import { NextRequest, NextResponse } from "next/server";
import { getStandings } from "@/lib/db/repository";

export async function GET(request: NextRequest) {
  const phase = request.nextUrl.searchParams.get("phase") ?? undefined;
  const items = await getStandings(phase);

  return NextResponse.json({
    items
  });
}
