// Auth middleware was retired when Lisa switched to a passwordless click-box
// picker. Left as a no-op shim in case anything still imports it.
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(_request: NextRequest) {
  return NextResponse.next();
}
