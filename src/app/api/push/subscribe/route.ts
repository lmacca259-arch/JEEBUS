import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    member_id?: string;
    subscription?: {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    user_agent?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const member_id = body.member_id;
  const endpoint = body.subscription?.endpoint;
  const p256dh = body.subscription?.keys?.p256dh;
  const auth = body.subscription?.keys?.auth;

  if (!member_id || !endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Missing member_id or subscription fields" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        member_id,
        endpoint,
        p256dh,
        auth,
        user_agent: body.user_agent ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
