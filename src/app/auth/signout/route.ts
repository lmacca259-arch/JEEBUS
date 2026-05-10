import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/** "Switch user" — clears the active member cookie and bounces home. */
export async function POST() {
  const c = await cookies();
  c.delete("hyetas_member_id");
  return NextResponse.redirect(
    new URL(
      "/",
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    { status: 303 },
  );
}
