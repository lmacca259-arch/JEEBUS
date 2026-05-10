import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

/** "Switch user" — clears the active member cookie and bounces home.
 *  Builds the redirect URL from the incoming request so it works on every
 *  environment (local, preview, production) without an env var. */
export async function POST(request: NextRequest) {
  const c = await cookies();
  c.delete("hyetas_member_id");
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
