import { createLogger, format, Logger, transports } from "winston";

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [pid:${process.pid}] ${level}: ${message}`
    )
  ),
  transports: [new transports.Console()]
});

export default logger;