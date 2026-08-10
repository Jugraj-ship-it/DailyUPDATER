// Best-effort, in-memory rate limiting. This resets on server restart and is
// scoped to a single process, so it does NOT protect a multi-instance /
// serverless deployment (each instance has its own memory). Fine for a
// single-server deployment or as a first layer; a real launch should also
// rely on the host's own abuse protection (e.g. Vercel's) or a shared store
// (e.g. Redis/Upstash) for a hard guarantee across instances.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}
