import "server-only";

import { ValidationError } from "@/lib/server/errors";

type ServerEnv = {
  databaseUrl: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  actionTimeoutMs: number;
  actionRateLimitWindowMs: number;
  actionRateLimitMax: number;
};

let cachedEnv: ServerEnv | null = null;

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  if (!process.env.DATABASE_URL) {
    throw new ValidationError("DATABASE_URL is required.");
  }

  cachedEnv = {
    databaseUrl: process.env.DATABASE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    actionTimeoutMs: parsePositiveInt(process.env.ACTION_TIMEOUT_MS, 12_000),
    actionRateLimitWindowMs: parsePositiveInt(process.env.ACTION_RATE_LIMIT_WINDOW_MS, 60_000),
    actionRateLimitMax: parsePositiveInt(process.env.ACTION_RATE_LIMIT_MAX, 30)
  };

  return cachedEnv;
}
