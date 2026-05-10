import webpush from "web-push";

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
};

export type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/** Send to all subscriptions for a member. Returns {sent, removed}. */
export async function pushToMember(
  supabase: {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (
          col: string,
          val: string,
        ) => Promise<{ data: SubscriptionRow[] | null; error: unknown }>;
      };
      delete: () => {
        eq: (col: string, val: string) => Promise<{ error: unknown }>;
      };
    };
  },
  memberId: string,
  payload: PushPayload,
): Promise<{ sent: number; removed: number }> {
  configure();

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("member_id", memberId);

  if (!subs || subs.length === 0) return { sent: 0, removed: 0 };

  const json = JSON.stringify(payload);
  let sent = 0;
  let removed = 0;

  for (const sub of subs) {
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
