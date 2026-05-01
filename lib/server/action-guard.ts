import "server-only";

import { assertRateLimit } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";
import { withTimeout } from "@/lib/server/timeout";
import { toPublicError } from "@/lib/server/errors";
import type { Session } from "@/lib/auth/types";

type GuardOptions = {
  action: string;
  session?: Session | null;
};

export async function guardedAction<T>({ action, session }: GuardOptions, operation: () => Promise<T>): Promise<T> {
  const actor = session?.userId ?? "anonymous";
  const startedAt = performance.now();

  assertRateLimit(`${actor}:${action}`);

  try {
    const result = await withTimeout(operation(), action);
    logger.info("server_action_completed", {
      action,
      actor,
      durationMs: Math.round(performance.now() - startedAt)
    });
    return result;
  } catch (error) {
    const publicError = toPublicError(error);
    logger.error("server_action_failed", {
      action,
      actor,
      code: publicError.code,
      status: publicError.status,
      durationMs: Math.round(performance.now() - startedAt)
    });
    throw publicError;
  }
}
