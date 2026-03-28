type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function serializeError(error: unknown): LogContext | undefined {
  if (!(error instanceof Error)) {
    return error === undefined ? undefined : { error };
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

function writeLog(level: LogLevel, event: string, context?: LogContext): void {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...(context ?? {}),
  };

  const line = JSON.stringify(payload);
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

export function logInfo(event: string, context?: LogContext): void {
  writeLog("info", event, context);
}

export function logWarn(event: string, context?: LogContext): void {
  writeLog("warn", event, context);
}

export function logError(event: string, error: unknown, context?: LogContext): void {
  writeLog("error", event, {
    ...(context ?? {}),
    error: serializeError(error),
  });
}
