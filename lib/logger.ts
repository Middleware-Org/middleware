type LogMeta = Record<string, unknown> | unknown;

const isDevelopment = process.env.NODE_ENV === "development";

function logWithMeta(method: "log" | "warn" | "error", message: string, meta?: LogMeta) {
  if (meta === undefined) {
    console[method](message);
    return;
  }

  console[method](message, meta);
}

export function createLogger(scope: string) {
  const prefix = `[${scope}]`;

  return {
    debug(message: string, meta?: LogMeta) {
      if (!isDevelopment) {
        return;
      }

      logWithMeta("log", `${prefix} ${message}`, meta);
    },
    info(message: string, meta?: LogMeta) {
      logWithMeta("log", `${prefix} ${message}`, meta);
    },
    warn(message: string, meta?: LogMeta) {
      logWithMeta("warn", `${prefix} ${message}`, meta);
    },
    error(message: string, meta?: LogMeta) {
      logWithMeta("error", `${prefix} ${message}`, meta);
    },
  };
}
