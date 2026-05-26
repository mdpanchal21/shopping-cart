const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

// Define format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define custom colored format for the console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    // 1. Log errors to a rotating file
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "7d", // Keep logs for 7 days
    }),
    // 2. Log everything to a combined rotating file
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "7d", // Keep logs for 7 days
    }),
  ],
});

// 3. Print logs to the console as well for local development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

module.exports = logger;
