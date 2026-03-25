import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "div2app",
    now: new Date().toISOString()
  });
}
