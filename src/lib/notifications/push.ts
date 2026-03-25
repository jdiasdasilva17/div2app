import webpush from "web-push";
import { Match } from "@/lib/types/competition";
import { deleteSubscription, listSubscriptions, SubscriptionRecord } from "@/lib/db/subscriptions";
import { createNotificationEvent, hasNotificationEvent } from "@/lib/db/repository";

function configureWebPush(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails("mailto:div2app@local.dev", publicKey, privateKey);
  return true;
}

function toPushSubscription(record: SubscriptionRecord): webpush.PushSubscription | null {
  if (!record.endpoint || !record.p256dh || !record.auth) {
    return null;
  }

  return {
    endpoint: record.endpoint,
    keys: {
      p256dh: record.p256dh,
      auth: record.auth
    }
  };
}

async function sendToSubscribers(payload: { title: string; body: string }, filter: (s: SubscriptionRecord) => boolean) {
  if (!configureWebPush()) {
    return 0;
  }

  const subscriptions = await listSubscriptions();
  const targets = subscriptions.filter(filter);
  const message = JSON.stringify(payload);

  const results = await Promise.all(
    targets.map(async (record) => {
      const subscription = toPushSubscription(record);
      if (!subscription) {
        return { ok: false, endpoint: record.endpoint, remove: false };
      }

      try {
        await webpush.sendNotification(subscription, message);
        return { ok: true, endpoint: record.endpoint, remove: false };
      } catch (error: unknown) {
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? Number((error as { statusCode: number }).statusCode)
            : 0;

        return {
          ok: false,
          endpoint: record.endpoint,
          remove: statusCode === 404 || statusCode === 410
        };
      }
    })
  );

  const staleEndpoints = results.filter((result) => result.remove).map((result) => result.endpoint);
  await Promise.all(staleEndpoints.map((endpoint) => deleteSubscription(endpoint)));

  return results.filter((result) => result.ok).length;
}

function formatResultLabel(match: Match): string {
  if (match.homeSets === null || match.awaySets === null) {
    return "resultado indisponivel";
  }

  return `${match.homeTeam} ${match.homeSets}-${match.awaySets} ${match.awayTeam}`;
}

export async function notifyResultPublished(match: Match): Promise<boolean> {
  const eventKey = `result:${match.id}:${match.homeSets ?? "x"}-${match.awaySets ?? "x"}`;
  if (await hasNotificationEvent(eventKey)) {
    return false;
  }

  const sent = await sendToSubscribers(
    {
      title: "Resultado publicado",
      body: formatResultLabel(match)
    },
    (subscription) => subscription.notify_result
  );

  if (sent > 0) {
    await createNotificationEvent(eventKey, "result", match.id);
  }

  return sent > 0;
}

export async function notifyMatchStartingSoon(match: Match): Promise<boolean> {
  const eventKey = `start:${match.id}`;
  if (await hasNotificationEvent(eventKey)) {
    return false;
  }

  const sent = await sendToSubscribers(
    {
      title: "Jogo a começar",
      body: `${match.homeTeam} vs ${match.awayTeam} com inicio em breve.`
    },
    (subscription) => subscription.notify_start
  );

  if (sent > 0) {
    await createNotificationEvent(eventKey, "start", match.id);
  }

  return sent > 0;
}
