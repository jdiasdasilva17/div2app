import { NextResponse } from "next/server";
import { listSubscriptions, upsertSubscription } from "@/lib/db/subscriptions";

interface SubscribePayload {
  endpoint?: string;
  p256dh?: string;
  auth?: string;
  contentEncoding?: string;
  teamScope?: string;
  notifyStart?: boolean;
  notifyResult?: boolean;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as SubscribePayload;

  if (!payload.endpoint) {
    return NextResponse.json({ error: "Field 'endpoint' is required." }, { status: 400 });
  }

  const items = await upsertSubscription({
    endpoint: payload.endpoint,
    p256dh: payload.p256dh,
    auth: payload.auth,
    contentEncoding: payload.contentEncoding,
    teamScope: payload.teamScope,
    notifyStart: payload.notifyStart,
    notifyResult: payload.notifyResult
  });

  return NextResponse.json({
    ok: true,
    items
  });
}

export async function GET() {
  const items = await listSubscriptions();
  return NextResponse.json({ items });
}
