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
export const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
export function score(samples, profile) {
  const failures = [];
  const limits = {
    lcpMs: profiles[profile].lcpMs,
    cls: 0.05,
    jsBytes: 100 * 1024,
    cssBytes: 40 * 1024,
    totalBytes: (profile === "mobile" ? 1 : 1.5) * 1024 * 1024,
    longTaskBlockingMs: profile === "mobile" ? 150 : 100,
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
  return { passed: failures.length === 0, metrics, limits, failures };
}
