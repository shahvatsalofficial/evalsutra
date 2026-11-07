// Wilson score interval; returns null when there are no trials (never fabricate certainty).
export function wilson(successes, n, z = 1.96) {
  if (!n) return null;
  const p = successes / n, z2 = z * z, d = 1 + z2 / n;
  const c = (p + z2 / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

// Unbiased pass@k estimator (Chen et al. 2021) for n trials with c correct.
export function passAtK(n, c, k) {
  if (!Number.isInteger(n) || !Number.isInteger(c) || !Number.isInteger(k) || k < 1 || k > n || c < 0 || c > n) throw new Error('passAtK needs integers 1<=k<=n and 0<=c<=n');
  if (n - c < k) return 1;
  let prod = 1;
  for (let i = n - c + 1; i <= n; i++) prod *= 1 - k / i;
  return 1 - prod;
}
