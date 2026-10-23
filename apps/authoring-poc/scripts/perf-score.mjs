export const profiles = {
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    cpu: 4,
    latency: 150,
    downloadMbps: 1.6,
    uploadMbps: 0.75,
    lcpMs: 2000,
  },
  desktop: {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    cpu: 1,
    latency: 40,
    downloadMbps: 10,
    uploadMbps: 10,
    lcpMs: 1500,
  },
};
export const sampleCount = 5;

// ── Machine factor ───────────────────────────────────────────────────────────
// The time budgets below were set on a developer Mac. A shared CI runner is
// slower in a way the CPU throttle multiplies (4× of a slow core is slower
// still), so the same page measured 1.6 s LCP here and 2.6 s on GitHub's
// runner with nothing changed. Lighthouse solves this with a benchmark index;
// this is the same idea: time a fixed CPU workload, compare it to what the
// reference machine takes, and scale only the TIME budgets (LCP, long tasks)
// by that ratio. Bytes and CLS do not depend on the machine and are not scaled.
// The factor never goes below 1 (a faster machine does not get a stricter
// budget) and is capped so a wildly slow runner fails rather than passing.
const REFERENCE_BENCH_MS = 43; // 2026-10-23, Apple Silicon, Node 24
export function machineFactor() {
  const bench = () => {
    const t0 = performance.now();
    let x = 0;
    const o = {};
    for (let i = 0; i < 2_000_000; i++) {
      x += Math.sqrt(i) * Math.sin(i);
      o[i & 1023] = x;
    }
    JSON.parse(JSON.stringify(o));
    return performance.now() - t0;
  };
  const benchMs = median(Array.from({ length: 5 }, bench));
  const factor = Math.min(2.5, Math.max(1, benchMs / REFERENCE_BENCH_MS));
  return { benchMs: Math.round(benchMs), factor: +factor.toFixed(2) };
}
export const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
export function score(samples, profile, factor = 1) {
  const failures = [];
  const limits = {
    lcpMs: Math.round(profiles[profile].lcpMs * factor),
    cls: 0.05,
    jsBytes: 100 * 1024,
    cssBytes: 40 * 1024,
    totalBytes: (profile === "mobile" ? 1 : 1.5) * 1024 * 1024,
    longTaskBlockingMs: Math.round((profile === "mobile" ? 150 : 100) * factor),
  };
  if (samples.length !== sampleCount)
    failures.push(
      `Expected ${sampleCount} cold runs, received ${samples.length}`,
    );
  const metrics = {};
  for (const [key, limit] of Object.entries(limits)) {
    const values = samples.map((sample) => sample[key]);
    if (
      values.length === 0 ||
      values.some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0 ||
          (["lcpMs", "jsBytes", "cssBytes", "totalBytes"].includes(key) &&
            value === 0),
      )
    ) {
      failures.push(`Missing or invalid metric: ${key}`);
      continue;
    }
    metrics[key] = median(values);
    if (metrics[key] > limit)
      failures.push(`${key}: ${metrics[key].toFixed(2)} exceeds ${limit}`);
  }
  for (const sample of samples) {
    if (sample.failedRequests?.length)
      failures.push(`Failed requests: ${sample.failedRequests.join(", ")}`);
    if (!sample.imageReady) failures.push("Primary image did not render");
    if (sample.editorCodeLoaded)
      failures.push("Editor entry loaded by visitor preview");
  }
  return { passed: failures.length === 0, metrics, limits, factor, failures };
}
