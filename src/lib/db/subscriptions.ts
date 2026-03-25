import { isSupabaseConfigured, supabaseRest } from "@/lib/db/supabase";

export interface SubscriptionRecord {
  endpoint: string;
  p256dh?: string;
  auth?: string;
  content_encoding?: string;
  team_scope: string;
  notify_start: boolean;
  notify_result: boolean;
}

const memorySubscriptions: SubscriptionRecord[] = [];

function normalizeSubscription(payload: {
  endpoint: string;
  p256dh?: string;
  auth?: string;
  contentEncoding?: string;
  teamScope?: string;
  notifyStart?: boolean;
  notifyResult?: boolean;
}): SubscriptionRecord {
  return {
    endpoint: payload.endpoint,
    p256dh: payload.p256dh,
    auth: payload.auth,
    content_encoding: payload.contentEncoding,
    team_scope: payload.teamScope ?? "all",
    notify_start: payload.notifyStart ?? true,
    notify_result: payload.notifyResult ?? true
  };
}

export async function upsertSubscription(payload: {
  endpoint: string;
  p256dh?: string;
  auth?: string;
  contentEncoding?: string;
  teamScope?: string;
  notifyStart?: boolean;
  notifyResult?: boolean;
}): Promise<SubscriptionRecord[]> {
  const record = normalizeSubscription(payload);

  if (isSupabaseConfigured()) {
    await supabaseRest<SubscriptionRecord[]>("subscriptions?on_conflict=endpoint", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify([record])
    });

    return listSubscriptions();
  }

  const exists = memorySubscriptions.some((item) => item.endpoint === record.endpoint);
  if (!exists) {
    memorySubscriptions.push(record);
  }

  return memorySubscriptions;
}

export async function listSubscriptions(): Promise<SubscriptionRecord[]> {
  if (isSupabaseConfigured()) {
    return supabaseRest<SubscriptionRecord[]>(
      "subscriptions?select=endpoint,p256dh,auth,content_encoding,team_scope,notify_start,notify_result"
    );
  }

  return memorySubscriptions;
}

export async function deleteSubscription(endpoint: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseRest(`subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
      method: "DELETE"
    });
    return;
  }

  const index = memorySubscriptions.findIndex((item) => item.endpoint === endpoint);
  if (index >= 0) {
    memorySubscriptions.splice(index, 1);
  }
}
