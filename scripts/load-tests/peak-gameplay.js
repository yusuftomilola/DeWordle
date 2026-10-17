/**
 * k6 load test: peak gameplay scenario.
 *
 * Simulates `K6_VUS` (default 100) concurrent, authenticated players who each
 * repeatedly create a game session and submit guesses to it. The test holds the
 * full load for `K6_DURATION` (default 2m, minimum useful run) after a short
 * ramp-up, so degradation over time shows up in the trend.
 *
 *   k6 run scripts/load-tests/peak-gameplay.js
 *   K6_BASE_URL=https://staging.example K6_VUS=200 K6_DURATION=5m k6 run scripts/load-tests/peak-gameplay.js
 *
 * Environment:
 *   K6_BASE_URL     API root including the global prefix (default http://localhost:3000/api/v1)
 *   K6_VUS          concurrent players at peak (default 100)
 *   K6_DURATION     time at peak load, e.g. 2m (default 2m)
 *   K6_RAMP         ramp-up time, e.g. 20s (default 20s)
 *   K6_GAME_ID      game id used when creating sessions (default 1)
 *   K6_PASSWORD     password for the generated test users (default LoadTest!2345)
 *   K6_RUN_ID       suffix that keeps test-user emails unique across runs
 *   K6_RESULTS_DIR  where summary files are written (default results)
 *
 * Output: p50/p95/p99 response times (overall and per endpoint), error and
 * timeout rates, written to `<K6_RESULTS_DIR>/peak-gameplay-summary.json` so the
 * CI run can upload it as an artifact and compare runs.
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = (__ENV.K6_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const VUS = parseInt(__ENV.K6_VUS || '100', 10);
const HOLD = __ENV.K6_DURATION || '2m';
const RAMP = __ENV.K6_RAMP || '20s';
const GAME_ID = parseInt(__ENV.K6_GAME_ID || '1', 10);
const PASSWORD = __ENV.K6_PASSWORD || 'LoadTest!2345';
const RUN_ID = __ENV.K6_RUN_ID || `${Date.now()}`;
const RESULTS_DIR = __ENV.K6_RESULTS_DIR || 'results';
const REQUEST_TIMEOUT = '10s';

// Five-letter guesses; the exact words do not matter for load.
const GUESSES = ['CRANE', 'SLATE', 'TRACE', 'AUDIO', 'ARISE', 'STARE'];
const MAX_GUESSES = 6;

// --- metrics ---------------------------------------------------------------
const errorRate = new Rate('errors');
const timeouts = new Counter('timeouts');
const loginLatency = new Trend('login_latency_ms', true);
const sessionLatency = new Trend('create_session_latency_ms', true);
const guessLatency = new Trend('guess_latency_ms', true);
const completedGames = new Counter('completed_games');

export const options = {
  scenarios: {
    peak_gameplay: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP, target: VUS },
        { duration: HOLD, target: VUS },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '15s',
    },
  },
  thresholds: {
    // Overall and per-endpoint latency budgets.
    http_req_duration: ['p(50)<300', 'p(95)<800', 'p(99)<1500'],
    create_session_latency_ms: ['p(95)<800'],
    guess_latency_ms: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],
    timeouts: ['count<10'],
    checks: ['rate>0.99'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

// --- per-VU authentication ---------------------------------------------------
let token = null;

function jsonParams(extraHeaders = {}) {
  return {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    timeout: REQUEST_TIMEOUT,
  };
}

function record(res, trend) {
  trend.add(res.timings.duration);
  const failed = res.status === 0 || res.status >= 400;
  errorRate.add(failed);
  // k6 error code 1050 is a request timeout.
  if (res.error_code === 1050) timeouts.add(1);
  return !failed;
}

/** Signs the VU's dedicated user up (first run) and logs in, caching the token. */
function authenticate() {
  const email = `load-vu${__VU}-${RUN_ID}@example.test`;
  const credentials = JSON.stringify({ email, password: PASSWORD });

  http.post(
    `${BASE_URL}/auth/signup`,
    JSON.stringify({
      email,
      username: `loadvu${__VU}${RUN_ID}`.slice(0, 40),
      password: PASSWORD,
    }),
    jsonParams(),
  ); // an "already exists" response is fine; login decides

  const res = http.post(`${BASE_URL}/auth/login`, credentials, jsonParams());
  const ok = record(res, loginLatency);
  const body = ok ? safeJson(res) : null;
  token = body && (body.access_token || (body.data && body.data.access_token)) || null;
  check(res, { 'login returns an access token': () => token !== null });
}

function safeJson(res) {
  try {
    return res.json();
  } catch (e) {
    return null;
  }
}

// --- scenario ------------------------------------------------------------------
export default function () {
  if (token === null) {
    authenticate();
    if (token === null) {
      sleep(2);
      return;
    }
  }
  const auth = jsonParams({ Authorization: `Bearer ${token}` });

  let sessionId = null;
  group('create session', () => {
    const res = http.post(
      `${BASE_URL}/sessions`,
      JSON.stringify({ gameId: GAME_ID, score: 0, durationSeconds: 0 }),
      auth,
    );
    const ok = record(res, sessionLatency);
    const body = ok ? safeJson(res) : null;
    sessionId = body && (body.id || (body.data && body.data.id)) || null;
    check(res, {
      'session created': (r) => r.status === 200 || r.status === 201,
      'session has an id': () => sessionId !== null,
    });
  });
  if (sessionId === null) {
    sleep(1);
    return;
  }

  group('submit guesses', () => {
    for (let attempt = 0; attempt < MAX_GUESSES; attempt++) {
      const res = http.post(
        `${BASE_URL}/sessions/${sessionId}/guess`,
        JSON.stringify({ guess: GUESSES[attempt % GUESSES.length] }),
        auth,
      );
      const ok = record(res, guessLatency);
      check(res, { 'guess accepted': (r) => r.status === 200 || r.status === 201 });
      if (!ok) return;
      const body = safeJson(res);
      const finished = body && (body.status === 'won' || body.isCorrect === true || body.finished === true);
      // Players think between guesses.
      sleep(Math.random() * 1.5 + 0.5);
      if (finished) break;
    }
    completedGames.add(1);
  });

  sleep(Math.random() * 2 + 1);
}

// --- summary ---------------------------------------------------------------------
function trendStats(metric) {
  if (!metric || !metric.values) return null;
  const v = metric.values;
  return { p50: v.med, p90: v['p(90)'], p95: v['p(95)'], p99: v['p(99)'], avg: v.avg, max: v.max };
}

export function handleSummary(data) {
  const m = data.metrics;
  const summary = {
    generatedAt: new Date().toISOString(),
    config: { baseUrl: BASE_URL, vus: VUS, hold: HOLD, ramp: RAMP, gameId: GAME_ID },
    latencyMs: {
      overall: trendStats(m.http_req_duration),
      login: trendStats(m.login_latency_ms),
      createSession: trendStats(m.create_session_latency_ms),
      guess: trendStats(m.guess_latency_ms),
    },
    requests: {
      total: m.http_reqs ? m.http_reqs.values.count : 0,
      perSecond: m.http_reqs ? m.http_reqs.values.rate : 0,
      errorRate: m.errors ? m.errors.values.rate : 0,
      failedRate: m.http_req_failed ? m.http_req_failed.values.rate : 0,
      timeouts: m.timeouts ? m.timeouts.values.count : 0,
    },
    completedGames: m.completed_games ? m.completed_games.values.count : 0,
    checksPassRate: m.checks ? m.checks.values.rate : 0,
    thresholds: Object.fromEntries(
      Object.entries(m)
        .filter(([, metric]) => metric.thresholds)
        .map(([name, metric]) => [
          name,
          Object.fromEntries(Object.entries(metric.thresholds).map(([expr, t]) => [expr, !t.ok ? 'FAILED' : 'passed'])),
        ]),
    ),
  };

  const line = (label, t) =>
    t ? `  ${label.padEnd(15)} p50=${t.p50.toFixed(0)}ms p95=${t.p95.toFixed(0)}ms p99=${t.p99.toFixed(0)}ms` : `  ${label}: n/a`;
  const text = [
    '',
    `Peak gameplay load test: ${VUS} VUs, ${HOLD} at peak`,
    line('overall', summary.latencyMs.overall),
    line('create session', summary.latencyMs.createSession),
    line('guess', summary.latencyMs.guess),
    `  requests=${summary.requests.total} (${summary.requests.perSecond.toFixed(1)}/s) ` +
      `error rate=${(summary.requests.errorRate * 100).toFixed(2)}% timeouts=${summary.requests.timeouts}`,
    '',
  ].join('\n');

  return {
    [`${RESULTS_DIR}/peak-gameplay-summary.json`]: JSON.stringify(summary, null, 2),
    [`${RESULTS_DIR}/peak-gameplay-raw.json`]: JSON.stringify(data, null, 2),
    stdout: text,
  };
}
