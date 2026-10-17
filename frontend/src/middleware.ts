import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, cspOptionsFromEnv } from "@/lib/csp";

/**
 * Delivers the Content Security Policy as a response header (#1533). The same
 * policy is also embedded as a <meta> tag in the root layout.
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", buildCsp(cspOptionsFromEnv(process.env)));
  return response;
}

export const config = {
  // Skip static assets and the CSP report sink itself.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/csp-report|sw.js|workbox-.*|manifest.json).*)",
  ],
};
