/**
 * Content Security Policy builder (#1533).
 *
 * The same policy is delivered two ways:
 *  - as an HTTP header by `src/middleware.ts` (full policy, including
 *    `report-uri`, `frame-ancestors` and other directives browsers ignore in
 *    a <meta> tag), and
 *  - as a <meta http-equiv> tag in `app/layout.tsx` for static exports / CDNs
 *    that strip headers (`forMeta: true` drops the meta-incompatible ones).
 */

export const DEFAULT_CSP_REPORT_URI = "/api/csp-report";

/** Stellar RPC/Horizon endpoints the wallet integration talks to. */
const STELLAR_ORIGINS = [
  "https://soroban-testnet.stellar.org",
  "https://horizon-testnet.stellar.org",
  "https://mainnet.sorobanrpc.com",
  "https://horizon.stellar.org",
];

/** Remote image host allowed by next.config.ts (`images.remotePatterns`). */
const IMAGE_ORIGINS = ["https://assets.dewordle.io"];

export interface CspOptions {
  /** Browser-side API base URL (NEXT_PUBLIC_API_URL). */
  apiUrl?: string;
  /** Where violation reports are POSTed. */
  reportUri?: string;
  /** Extra script origins (CDNs) permitted in addition to 'self'. */
  scriptOrigins?: string[];
  /** Extra connect-src origins. */
  connectOrigins?: string[];
  /** Development adds 'unsafe-eval' (React refresh) and ws: for HMR. */
  isDev?: boolean;
  /** Omit directives that browsers ignore inside a <meta> element. */
  forMeta?: boolean;
}

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** A websocket origin for the same host as an http(s) origin. */
function wsOriginOf(origin: string): string {
  return origin.replace(/^http/, "ws");
}

function unique(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => !!v))];
}

export function buildCsp(options: CspOptions = {}): string {
  const apiOrigin = originOf(options.apiUrl);
  const connect = unique([
    "'self'",
    apiOrigin,
    apiOrigin ? wsOriginOf(apiOrigin) : null,
    ...STELLAR_ORIGINS,
    ...(options.connectOrigins ?? []),
    options.isDev ? "ws:" : null,
  ]);

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // Next.js emits inline bootstrap scripts, so 'unsafe-inline' is required
    // until a nonce-based policy (dynamic rendering) is adopted.
    "script-src": unique([
      "'self'",
      "'unsafe-inline'",
      options.isDev ? "'unsafe-eval'" : null,
      ...(options.scriptOrigins ?? []),
    ]),
    // Tailwind and next/font inject inline <style> blocks.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...IMAGE_ORIGINS],
    "font-src": ["'self'", "data:"],
    "connect-src": connect,
    "worker-src": ["'self'", "blob:"], // next-pwa service worker
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  if (!options.forMeta) {
    directives["frame-ancestors"] = ["'none'"];
    directives["report-uri"] = [options.reportUri || DEFAULT_CSP_REPORT_URI];
  }

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

/** Reads the deployment configuration from environment variables. */
export function cspOptionsFromEnv(env: Record<string, string | undefined>): CspOptions {
  const list = (v?: string) =>
    (v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return {
    apiUrl: env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    reportUri: env.NEXT_PUBLIC_CSP_REPORT_URI || DEFAULT_CSP_REPORT_URI,
    scriptOrigins: list(env.NEXT_PUBLIC_CSP_SCRIPT_ORIGINS),
    connectOrigins: list(env.NEXT_PUBLIC_CSP_CONNECT_ORIGINS),
    isDev: env.NODE_ENV === "development",
  };
}
