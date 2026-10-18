// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { buildCsp, cspOptionsFromEnv, DEFAULT_CSP_REPORT_URI } from "@/lib/csp";
import { middleware, config } from "@/middleware";
import { POST } from "@/app/api/csp-report/route";

const directive = (csp: string, name: string) =>
  csp
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith(`${name} `))
    ?.slice(name.length + 1)
    .split(" ");

describe("buildCsp (#1533)", () => {
  const csp = buildCsp({ apiUrl: "https://api.dewordle.io/v1" });

  it("restricts scripts to self (plus configured CDNs)", () => {
    expect(directive(csp, "script-src")).toEqual(["'self'", "'unsafe-inline'"]);
    const withCdn = buildCsp({ scriptOrigins: ["https://cdn.example.com"] });
    expect(directive(withCdn, "script-src")).toContain("https://cdn.example.com");
  });

  it("allows only self and inline styles", () => {
    expect(directive(csp, "style-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("allows images from self and data: URIs", () => {
    const img = directive(csp, "img-src")!;
    expect(img).toEqual(expect.arrayContaining(["'self'", "data:"]));
    expect(img).not.toContain("*");
  });

  it("limits connect-src to self, the API origin (http and ws) and Stellar endpoints", () => {
    const connect = directive(csp, "connect-src")!;
    expect(connect).toEqual(
      expect.arrayContaining([
        "'self'",
        "https://api.dewordle.io",
        "wss://api.dewordle.io",
        "https://soroban-testnet.stellar.org",
        "https://horizon.stellar.org",
      ]),
    );
    expect(connect).not.toContain("ws:");
  });

  it("locks down framing, objects, base-uri and forms", () => {
    expect(directive(csp, "object-src")).toEqual(["'none'"]);
    expect(directive(csp, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(csp, "base-uri")).toEqual(["'self'"]);
    expect(directive(csp, "form-action")).toEqual(["'self'"]);
    expect(directive(csp, "default-src")).toEqual(["'self'"]);
  });

  it("reports violations to a configurable endpoint", () => {
    expect(directive(csp, "report-uri")).toEqual([DEFAULT_CSP_REPORT_URI]);
    expect(directive(buildCsp({ reportUri: "https://r.example/csp" }), "report-uri")).toEqual([
      "https://r.example/csp",
    ]);
  });

  it("drops directives that browsers ignore in a <meta> tag", () => {
    const meta = buildCsp({ forMeta: true });
    expect(meta).not.toContain("report-uri");
    expect(meta).not.toContain("frame-ancestors");
    expect(meta).toContain("script-src");
  });

  it("only development gets unsafe-eval and ws:", () => {
    expect(directive(buildCsp({}), "script-src")).not.toContain("'unsafe-eval'");
    const dev = buildCsp({ isDev: true });
    expect(directive(dev, "script-src")).toContain("'unsafe-eval'");
    expect(directive(dev, "connect-src")).toContain("ws:");
  });

  it("ignores an unparsable API URL", () => {
    expect(directive(buildCsp({ apiUrl: "not a url" }), "connect-src")).not.toContain("not a url");
  });

  it("reads configuration from the environment", () => {
    const opts = cspOptionsFromEnv({
      NEXT_PUBLIC_API_URL: "https://api.x.io",
      NEXT_PUBLIC_CSP_REPORT_URI: "/r",
      NEXT_PUBLIC_CSP_SCRIPT_ORIGINS: "https://a.io, https://b.io",
      NODE_ENV: "production",
    });
    expect(opts).toMatchObject({
      apiUrl: "https://api.x.io",
      reportUri: "/r",
      scriptOrigins: ["https://a.io", "https://b.io"],
      isDev: false,
    });
  });
});

describe("middleware", () => {
  it("sets the CSP header on page responses", () => {
    const res = middleware(new NextRequest("http://localhost:3000/"));
    expect(res.headers.get("content-security-policy")).toContain("default-src 'self'");
  });

  it("does not run for static assets or the report sink", () => {
    const pattern = new RegExp(`^${config.matcher[0]}$`);
    expect(pattern.test("/")).toBe(true);
    expect(pattern.test("/sessions")).toBe(true);
    expect(pattern.test("/_next/static/chunk.js")).toBe(false);
    expect(pattern.test("/api/csp-report")).toBe(false);
  });
});

describe("POST /api/csp-report", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CSP_REPORT_FORWARD_URL;
  });

  const post = (body: string, headers: Record<string, string> = {}) =>
    POST(
      new Request("http://localhost/api/csp-report", {
        method: "POST",
        headers: { "content-type": "application/csp-report", ...headers },
        body,
      }),
    );

  it("logs a valid report and answers 204", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const res = await post(JSON.stringify({ "csp-report": { "blocked-uri": "https://evil.test" } }));
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledWith("[csp-violation]", expect.stringContaining("evil.test"));
  });

  it("rejects malformed JSON and oversized bodies", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect((await post("{nope")).status).toBe(400);
    expect((await post("x".repeat(20_000))).status).toBe(413);
  });

  it("forwards the report to the configured endpoint", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    process.env.CSP_REPORT_FORWARD_URL = "https://collector.example/csp";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null));
    await post(JSON.stringify({ a: 1 }));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://collector.example/csp",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
