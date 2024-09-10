import path from 'path';
import { format as formatDate } from 'date-fns';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define your severity levels.
const levels = {
  info: 0,
  warn: 1,
  http: 2,
  error: 3,
};

// Define colors for each log level
const colors = {
  info: 'green',
  warn: 'yellow',
  http: 'cyan',
  error: 'red',
};

// Link the colors to the severity levels
winston.addColors(colors);

// Custom format for logging
const myLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    const formattedDate = formatDate(
      new Date(timestamp),
      'EEEE, yyyy-MM-dd HH:mm:ss',
    );
    return `${level.toUpperCase()}: ${message} - [${formattedDate}]`;
  }),
  winston.format.colorize({ all: true }), // Add color to the logs
);

// Define transports
const transports = [
  new winston.transports.Console({
    level: 'error', // Console should capture all levels starting from 'error' and above
  }),
  new DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'info', '%DATE%.log'),
    datePattern: 'DD-MM-YYYY-HH',
    maxSize: '20m',
    maxFiles: '1d',
    level: 'info', // Log 'info' level and higher
  }),

  new DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'warn', '%DATE%.log'),
    datePattern: 'DD-MM-YYYY-HH',
    maxSize: '20m',
    maxFiles: '1d',
    level: 'warn', // Log 'warn' level and higher
  }),

  new DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'http', '%DATE%.log'),
    datePattern: 'DD-MM-YYYY-HH',
    maxSize: '20m',
    maxFiles: '1d',
    level: 'http', // Log 'http' level and higher
  }),

  new DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'error', '%DATE%.log'),
    datePattern: 'DD-MM-YYYY-HH',
    maxSize: '20m',
    maxFiles: '1d',
    level: 'error', // Log only 'error'
  }),
].filter(Boolean);

// Create a logger instance
const logger = winston.createLogger({
  levels,
  format: myLogFormat,
  transports,
  level: 'error', // Set global logger level to capture all logs starting from 'error' and above
});

export default logger;
