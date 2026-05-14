import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

let configured = false;
function configure() {
  if (configured) return;
  const subject = process.env.VAPID_SUBJECT || "mailto:lmacca259@gmail.com";
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    throw new Error("VAPID keys are not configured");
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  /** When true, the service worker renders a silent notification —
   *  visible on the lock screen but no sound or vibration. Used by the
   *  sleep guard for Lisa during her post-shift sleep window. */
  silent?: boolean;
};

export type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Send a push payload to every subscribed device for a member.
 * Creates its own Supabase client so callers don't have to pass one
 * (and we avoid the "Type instantiation is excessively deep" error
 * that bit us in slice 8 when the @supabase/ssr return type was the
 * parameter type).
 */
export async function pushToMember(
  memberId: string,
  payload: PushPayload,
): Promise<{ sent: number; removed: number }> {
  configure();
  const supabase = await createClient();

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("member_id", memberId);

  const rows = (subs as SubscriptionRow[] | null) ?? [];
  if (rows.length === 0) return { sent: 0, removed: 0 };

  const json = JSON.stringify(payload);
  let sent = 0;
  let removed = 0;

  for (const sub of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        json,
      );
      sent += 1;
    } catch (err) {
      const status =
        (err as { statusCode?: number; status?: number }).statusCode ??
        (err as { status?: number }).status;
      // 404 or 410 means the subscription is gone — clean it up.
      if (status === 404 || status === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        removed += 1;
      }
    }
  }

  return { sent, removed };
}
