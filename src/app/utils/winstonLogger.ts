import path from 'path';
import { format as formatDate } from 'date-fns';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp } = format;

// Custom format for console logging
const myLogFormat = format.combine(
  format.printf(({ level, message, timestamp }) => {
    const formattedDate = formatDate(
      new Date(timestamp),
      'EEEE, yyyy-MM-dd HH:mm:ss',
    );
    return `${level}: ${message} - ${formattedDate}`;
  }),
);

// Create a Winston logger
const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), myLogFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'winston', 'success', '%DATE%.log'),
      datePattern: 'DD-MM-YYYY-HH',
      maxSize: '20m',
      maxFiles: '1d',
    }),
  ],
});

// Create a Winston error logger
const errorLogger = createLogger({
  level: 'error',
  format: combine(timestamp(), myLogFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'winston', 'error', '%DATE%.log'),
      datePattern: 'DD-MM-YYYY-HH',
      maxSize: '20m',
      maxFiles: '1d',
    }),
  ],
});

export { logger, errorLogger };
