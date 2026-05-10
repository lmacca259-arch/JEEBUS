"use client";

import { useEffect, useState } from "react";

type Props = { memberId: string; memberName: string };

type Status = "idle" | "unsupported" | "denied" | "registering" | "enabled" | "error";

export function EnableNotifications({ memberId, memberName }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    // Check existing subscription
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return;
      const existing = await reg.pushManager.getSubscription();
      if (existing && Notification.permission === "granted") {
        setStatus("enabled");
      }
    });
  }, []);

  async function enable() {
    setError(null);
    setStatus("registering");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublic) {
        setStatus("error");
        setError("Server not configured (VAPID key missing). Tell Lisa.");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublic),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          subscription: sub.toJSON(),
          user_agent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Subscribe failed (${res.status})`);
      }
      setStatus("enabled");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not enable notifications");
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-[11px] text-slate-500">
        Notifications aren&apos;t supported on this browser. On an iPhone, add the
        app to your home screen first (Share → Add to Home Screen) and try again.
      </p>
    );
  }
  if (status === "denied") {
    return (
      <p className="text-[11px] text-amber-300">
        Notifications are blocked for this device. Open browser settings for HYETAS
        and enable them, then refresh.
      </p>
    );
  }
  if (status === "enabled") {
    return (
      <p className="text-[11px] text-emerald-400">
        🔔 Notifications enabled for {memberName} on this device.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={enable}
        disabled={status === "registering"}
        className="w-full rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-60"
      >
        {status === "registering" ? "Enabling…" : "🔔 Enable notifications on this device"}
      </button>
      {error ? (
        <p className="text-[11px] text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-[10px] text-slate-500">
        Your phone will buzz when chores assigned to you are due. Per-device — each
        family member taps this on their own phone.
      </p>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
