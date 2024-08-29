import fs from 'fs';
import { errorLogger, logger } from '../utils/winstonLogger';
import colors from 'colors';

// Delete a single file if it exists.
const unlinkFile = (filePath: string) => {
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Attempt to delete each file
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

// Delete multiple files.
const unlinkFiles = (filePaths: string[]) => {
  filePaths.forEach((filePath) => {
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Attempt to delete each file
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
  });
};

export { unlinkFile, unlinkFiles };
