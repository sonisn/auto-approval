/**
 * Logger Configuration
 *
 * Configures a Winston logger for console output with timestamps and process IDs.
 * Used throughout the application for structured logging during automation runs.
 */
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [pid:${process.pid}] ${level}: ${message}`
    )
  ),
  transports: [new transports.Console()],
});

export default logger;
