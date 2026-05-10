// No-op middleware: auth was removed (Lisa picks who she is via cookie click).
// Kept as an empty pass-through so routing still works normally.
import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
