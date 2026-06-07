interface LogEntry {
  timestamp: string;
  level: "log" | "warn" | "error";
  message: string[];
}

class Logger {
  private logs: LogEntry[] = [];
  private static instance: Logger;
  private originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  private constructor() {
    this.init();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private init() {
    console.log = (...args: any[]) => {
      this.addLog("log", args);
      this.originalConsole.log(...args);
    };

    console.warn = (...args: any[]) => {
      this.addLog("warn", args);
      this.originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      this.addLog("error", args);
      this.originalConsole.error(...args);
    };
  }

  private addLog(level: LogEntry["level"], args: any[]) {
    const message = args.map((arg) => {
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    });

    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
    });
  }

  public downloadLogs() {
    const logContent = this.logs
      .map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message.join(" ")}`)
      .join("\n");

    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = Logger.getInstance();
