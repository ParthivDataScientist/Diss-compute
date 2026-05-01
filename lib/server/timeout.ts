import "server-only";

import { getServerEnv } from "@/lib/server/env";
import { TimeoutError } from "@/lib/server/errors";

export async function withTimeout<T>(operation: Promise<T>, label: string, timeoutMs = getServerEnv().actionTimeoutMs): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(`${label} timed out.`)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
