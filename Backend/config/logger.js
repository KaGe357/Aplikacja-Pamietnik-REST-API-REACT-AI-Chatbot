import winston from "winston";
import path from "path";
import "winston-daily-rotate-file";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine environment (development/production)
const env = process.env.NODE_ENV || "development";
const isDevelopment = env === "development";

// Format for development: colorful, readable
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Format for production: JSON
const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // adds stack trace to errors
  winston.format.json()
);

// Transport: rotating file for ERROR (errors only)
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../logs/error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxFiles: "14d", // keep logs for 14 days
  maxSize: "20m", // max 20MB per file
  format: prodFormat,
});

// Transport: rotating file for EVERYTHING (info+)
const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../logs/combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "info",
  maxFiles: "14d",
  maxSize: "20m",
  format: prodFormat,
});

// Transport: console (different formats for dev/prod)
const consoleTransport = new winston.transports.Console({
  format: isDevelopment ? devFormat : prodFormat,
  level: isDevelopment ? "debug" : "info",
});

// Create logger
const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: prodFormat, // default format (overridden by transport)
  transports: [consoleTransport, errorFileTransport, combinedFileTransport],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/exceptions.log"),
      format: prodFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/rejections.log"),
      format: prodFormat,
    }),
  ],
});

// Mask sensitive data in logs
logger.maskSensitive = (str) => {
  if (!str) return str;
  // Mask API keys (example: AbcdefXXX -> Abcdef****)
  return str
    .replace(/(key=)[^&\s]*/gi, "$1****")
    .replace(/(Bearer\s+)[\w-]+/gi, "$1****")
    .replace(/(password["']?\s*:\s*["']?)[^"',}\s]+/gi, "$1****");
};

export default logger;
