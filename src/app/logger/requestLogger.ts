import morgan from 'morgan';
import { logger } from './winstonLogger';

// Define a custom Morgan format
const morganFormat = ':method :url :status :response-time ms';

// Create a Morgan middleware instance and assign it to a variable
const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      const [method, url, status, responseTime] = message.trim().split(' ');

      // Construct a log object and log it using the custom logger
      const logObject = {
        method,
        url,
        status,
        responseTime,
      };

      // Log the object as a JSON string
      logger.info(JSON.stringify(logObject));
    },
  },
});

export default requestLogger;
