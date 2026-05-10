import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pushToMember, type PushPayload } from "@/lib/push/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DueRow = {
  assignment_id: string;
  member_id: string | null;
  member_name: string;
  chore_name: string;
  due_at: string;
};

/**
 * Vercel cron handler. Runs every 5 minutes (see vercel.json).
 * Finds assignments due within the last hour that we haven't nudged for,
 * sends a web push to the assignee, and logs the nudge.
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = request.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const supabase = await createClient();

  // Make sure today's chores have been generated. Cheap, idempotent.
  await supabase.rpc("generate_assignments_for_today");

  // Find pending assignments due in the last hour that haven't been nudged.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const until = new Date(Date.now() + 60 * 1000).toISOString();

  const { data: rows, error } = await supabase.rpc("due_assignments_for_nudge", {
    p_since: since,
    p_until: until,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = (rows as DueRow[] | null) ?? [];
  let pushed = 0;
  let skipped = 0;
  let cleanedUp = 0;

  for (const row of due) {
    if (!row.member_id) {
      skipped += 1;
      continue;
    }
    const payload: PushPayload = {
      title: `🌙 Tonight · ${row.chore_name}`,
      body: `Hey ${row.member_name}, time to do it. Tap to mark done.`,
      url: "/",
      tag: `chore-${row.assignment_id}`,
    };
    const result = await pushToMember(supabase, row.member_id, payload);
    pushed += result.sent;
    cleanedUp += result.removed;

    await supabase.from("nudges").insert({
      member_id: row.member_id,
      assignment_id: row.assignment_id,
      channel: "web-push",
    });
  }

  return NextResponse.json({
    checked: due.length,
    pushed,
    skipped_family: skipped,
    cleaned_up_dead_subscriptions: cleanedUp,
  });
}
