import { NextResponse } from "next/server";
import { getMatches } from "@/lib/db/repository";

export async function GET() {
  const items = await getMatches();
  return NextResponse.json({
    items
  });
}
