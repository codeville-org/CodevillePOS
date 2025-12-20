import { app } from "electron";

import * as fs from "fs";
import * as path from "path";

export function setupLogging() {
  if (app.isPackaged) {
    // Create logs directory in user data
    const logsDir = path.join(app.getPath("userData"), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log file with timestamp
    const logFile = path.join(
      logsDir,
      `app-${new Date().toISOString().replace(/:/g, "-")}.log`
    );

    const logStream = fs.createWriteStream(logFile, { flags: "a" });

    // Helper function to format log messages
    const formatLog = (type: string, ...args: any[]) => {
      const timestamp = new Date().toISOString();
      const message = args
        .map((arg) => {
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");
      return `[${timestamp}] [${type}] ${message}\n`;
    };

    // Override console methods
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    console.log = (...args: any[]) => {
      originalConsoleLog(...args);
      logStream.write(formatLog("LOG", ...args));
    };

    console.error = (...args: any[]) => {
      originalConsoleError(...args);
      logStream.write(formatLog("ERROR", ...args));
    };

    console.warn = (...args: any[]) => {
      originalConsoleWarn(...args);
      logStream.write(formatLog("WARN", ...args));
    };

    console.info = (...args: any[]) => {
      originalConsoleInfo(...args);
      logStream.write(formatLog("INFO", ...args));
    };

    // Log the log file location
    console.log(`=== Application Started ===`);
    console.log(`Log file location: ${logFile}`);
    console.log(`User data directory: ${app.getPath("userData")}`);
    console.log(`App version: ${app.getVersion()}`);
    console.log(`Electron version: ${process.versions.electron}`);
    console.log(`Node version: ${process.versions.node}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log("===========================");

    // Handle process errors
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      logStream.write(
        formatLog("UNCAUGHT_EXCEPTION", error.message, error.stack)
      );
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      logStream.write(formatLog("UNHANDLED_REJECTION", reason));
    });

    // Clean up on app quit
    app.on("quit", () => {
      logStream.end();
    });

    return logFile;
  }
}
