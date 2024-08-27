import fs from 'fs';
import { errorLogger, logger } from '../utils/winstonLogger';
import colors from 'colors';

const unlinkFile = (filePath: string) => {
  // Check if the file exists before attempting to delete it
  if (fs.existsSync(filePath)) {
    // File exists, proceed to delete it
    fs.unlink(filePath, (err) => {
      if (err) {
        errorLogger.error(
          colors.bgRed(`Failed to delete file: ${err?.message}`),
        );
      } else {
        logger.info(colors.bgGreen(`File deleted successfully: ${filePath}`));
      }
    });
  } else {
    logger.warn(colors.bgYellow(`File does not exist: ${filePath}!`));
  }
};

export default unlinkFile;
