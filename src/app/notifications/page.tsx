"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/app/_components/BottomNav";

interface SubscriptionItem {
  endpoint: string;
  team_scope: string;
  notify_start: boolean;
  notify_result: boolean;
}

function base64UrlToUint8Array(base64UrlString: string): Uint8Array {
  const padding = "=".repeat((4 - (base64UrlString.length % 4)) % 4);
  const base64 = (base64UrlString + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export default function NotificationsPage() {
  const [status, setStatus] = useState<string>("Desativadas");
  const [items, setItems] = useState<SubscriptionItem[]>([]);

  const permission = useMemo(() => {
    if (typeof Notification === "undefined") {
      return "unsupported";
    }

    return Notification.permission;
  }, []);

  async function refreshSubscriptions() {
    const response = await fetch("/api/subscribe");
    const payload = (await response.json()) as { items: SubscriptionItem[] };
    setItems(payload.items);
  }

  async function enableNotifications() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("Este browser nao suporta Web Push.");
      return;
    }

    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== "granted") {
      setStatus("Permissao negada para notificacoes.");
      return;
    }

    const vapidKeyResponse = await fetch("/api/push/public-key");
    const keyPayload = (await vapidKeyResponse.json()) as { publicKey?: string; error?: string };
    if (!keyPayload.publicKey) {
      setStatus(keyPayload.error ?? "VAPID public key em falta.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = base64UrlToUint8Array(keyPayload.publicKey) as unknown as BufferSource;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    const subscriptionJson = subscription.toJSON();

    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh,
        auth: subscriptionJson.keys?.auth,
        contentEncoding: subscription.options?.applicationServerKey ? "aesgcm" : undefined,
        teamScope: "all",
        notifyStart: true,
        notifyResult: true
      })
    });

    setStatus("Notificacoes ativas no dispositivo.");
    await refreshSubscriptions();
  }

  return (
    <main className="stack">
      <div>
        <h1 className="page-title">Notificacoes</h1>
        <p className="page-subtitle">Alertas para inicio de jogo e publicacao de resultado.</p>
      </div>

      <section className="card stack">
        <div>
          <strong>Estado atual:</strong> {status}
        </div>
        <div>
          <strong>Permissao:</strong> {permission}
        </div>
        <button onClick={enableNotifications} type="button">
          Ativar notificacoes neste Android
        </button>
        <button onClick={refreshSubscriptions} type="button">
          Recarregar subscricoes
        </button>
      </section>

      <section className="card stack">
        <h2 className="page-title">Subscricoes registadas</h2>
        {items.length === 0 ? (
          <span>Nenhuma subscricao registada.</span>
        ) : (
          items.map((item) => (
            <article key={item.endpoint}>
              <strong>{item.team_scope}</strong>
              <div>{item.endpoint.slice(0, 64)}...</div>
            </article>
          ))
        )}
      </section>

      <BottomNav />
    </main>
  );
}
