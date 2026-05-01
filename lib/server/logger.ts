import "server-only";

type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, boolean | number | string | null | undefined>;

function sanitizeContext(context: LogContext = {}) {
  return Object.fromEntries(
    Object.entries(context).filter(([key, value]) => value !== undefined && !key.toLowerCase().includes("password"))
  );
}

function write(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizeContext(context)
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context)
};
