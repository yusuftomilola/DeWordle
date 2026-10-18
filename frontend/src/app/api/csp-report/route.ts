/**
 * CSP violation sink (#1533). Browsers POST `application/csp-report` (legacy
 * report-uri) or `application/reports+json` bodies here. Reports are logged and,
 * if CSP_REPORT_FORWARD_URL is set, forwarded to that endpoint (for example a
 * logging/monitoring collector).
 */
const MAX_BYTES = 16 * 1024;

export async function POST(request: Request): Promise<Response> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return new Response(null, { status: 413 });

  const text = await request.text();
  if (text.length > MAX_BYTES) return new Response(null, { status: 413 });

  let report: unknown;
  try {
    report = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  console.warn("[csp-violation]", JSON.stringify(report).slice(0, 2000));

  const forwardUrl = process.env.CSP_REPORT_FORWARD_URL;
  if (forwardUrl) {
    // Best effort: a collector outage must never fail the browser's report.
    void fetch(forwardUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).catch(() => undefined);
  }

  return new Response(null, { status: 204 });
}
