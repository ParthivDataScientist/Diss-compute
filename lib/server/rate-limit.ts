import "server-only";

import { getServerEnv } from "@/lib/server/env";
import { RateLimitError } from "@/lib/server/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function assertRateLimit(key: string) {
  const { actionRateLimitWindowMs, actionRateLimitMax } = getServerEnv();
  const now = Date.now();
  pruneExpiredBuckets(now);

  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { count: 1, resetAt: now + actionRateLimitWindowMs });
    return;
  }

  if (bucket.count >= actionRateLimitMax) {
    throw new RateLimitError();
  }

  bucket.count += 1;
}
