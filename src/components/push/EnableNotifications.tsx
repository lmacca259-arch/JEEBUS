"use client";

import { useEffect, useState } from "react";

type Props = { memberId: string; memberName: string };

type Status =
  | "idle"
  | "unsupported"
  | "denied"
  | "registering"
  | "enabled"
  | "error";

const DISMISS_KEY = "hyetas_push_banner_dismissed";

export function EnableNotifications({ memberId, memberName }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return;
      const existing = await reg.pushManager.getSubscription();
      if (existing && Notification.permission === "granted") {
        setStatus("enabled");
      }
    });
    if (window.localStorage.getItem(DISMISS_KEY) === memberId) {
      setDismissed(true);
    }
  }, [memberId]);

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
        setError("Server not configured — tell Lisa.");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublic) as BufferSource,
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

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, memberId);
    } catch {
      /* ignore */
    }
  }

  // Hide entirely when enabled, unsupported, or dismissed.
  if (status === "enabled" || status === "unsupported" || dismissed) {
    return null;
  }

  const isError = status === "error";
  const isDenied = status === "denied";

  return (
    <div
      className={`relative flex items-center gap-3 border-b px-4 py-2 text-xs ${
        isError || isDenied
          ? "border-rose-700/40 bg-rose-900/30 text-rose-200"
          : "border-amber-300/30 bg-amber-300/10 text-amber-100"
      }`}
      role={isError ? "alert" : undefined}
    >
      <span aria-hidden className="text-base">
        {isError || isDenied ? "🔕" : "🔔"}
      </span>
      <span className="flex-1 leading-tight">
        {isDenied ? (
          <>
            Notifications are blocked for {memberName} on this device. Open the
            browser settings to allow.
          </>
        ) : isError ? (
          error || "Couldn't enable notifications."
        ) : (
          <>
            Get a buzz when chores are due, {memberName}. One tap per device.
          </>
        )}
      </span>
      {!isDenied ? (
        <button
          type="button"
          onClick={enable}
          disabled={status === "registering"}
          className="shrink-0 rounded-lg bg-amber-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-950 transition hover:bg-amber-200 disabled:opacity-60"
        >
          {status === "registering" ? "Enabling…" : "Enable"}
        </button>
      ) : null}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-current/60 hover:text-current"
      >
        ✕
      </button>
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
