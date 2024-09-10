import path from 'path';
import { format as formatDate } from 'date-fns';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config';

// Define your severity levels.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
};

const level = () => {
  const isDevelopment = config.nodeEnv === 'development';
  return isDevelopment ? 'http' : 'warn';
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
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
  new winston.transports.Console(),

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
];

// Create a logger instance
const logger = winston.createLogger({
  levels,
  level: level(),
  format: myLogFormat,
  transports,
});

export default logger;
