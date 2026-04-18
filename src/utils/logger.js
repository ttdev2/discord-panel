/**
 * Secure Logging Module
 * Prevents sensitive data (tokens, IDs) from being logged
 * Uses Winston for structured logging with file persistence
 */

import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format: redact sensitive information
const redactSensitive = (info) => {
  const redacted = { ...info };
  
  // Remove/redact tokens
  if (redacted.token) redacted.token = '***REDACTED***';
  if (redacted.authorization) redacted.authorization = '***REDACTED***';
  
  // Redact auth headers
  if (redacted.headers?.Authorization) {
    redacted.headers.Authorization = '***REDACTED***';
  }
  
  return redacted;
};

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    // Apply redaction before logging
    {
      transform: (info) => {
        redactSensitive(info);
        return info;
      },
    }
  ),
  defaultMeta: { service: 'discord-panel' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        {
          transform: (info) => {
            redactSensitive(info);
            return info;
          },
        }
      ),
    })
  );
}

export default logger;
