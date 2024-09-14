import fs from 'fs';
import logger from '../logger/winston.logger';
import colors from 'colors';
import path from 'path';

// Define the base directory for the uploads folder
const UPLOADS_BASE_DIR = path.resolve('public');

// Delete a single file if it exists.
const unlinkFile = (relativeFilePath: string | undefined) => {
  if (!relativeFilePath || typeof relativeFilePath !== 'string') {
    logger.error(colors.bgRed(`Invalid file path: ${relativeFilePath}`));
    return; // Exit early if the file path is invalid
  }

  // Construct the full path using the base directory
  const fullPath = path.join(UPLOADS_BASE_DIR, relativeFilePath);

  // Check if the file exists
  if (fs.existsSync(fullPath)) {
    // Attempt to delete each file
    fs.unlink(fullPath, (err) => {
      if (err) {
        logger.warn(colors.bgRed(`Failed to delete file: ${err?.message}`));
      } else {
        logger.info(colors.bgGreen(`File deleted successfully: ${fullPath}`));
      }
    });
  } else {
    logger.warn(colors.bgYellow(`File does not exist: ${fullPath}!`));
  }
};

// Delete multiple files.
const unlinkFiles = (relativeFilePaths: string[]) => {
  relativeFilePaths.forEach((relativeFilePath) => {
    if (!relativeFilePath || typeof relativeFilePath !== 'string') {
      logger.error(colors.bgRed(`Invalid file path: ${relativeFilePath}`));
      return; // Skip this file if the path is invalid
    }

    // Construct the full path using the base directory
    const fullPath = path.join(UPLOADS_BASE_DIR, relativeFilePath);

    // Check if the file exists
    if (fs.existsSync(fullPath)) {
      // Attempt to delete each file
      fs.unlink(fullPath, (err) => {
        if (err) {
          logger.error(colors.bgRed(`Failed to delete file: ${err?.message}`));
        } else {
          logger.info(colors.bgGreen(`File deleted successfully: ${fullPath}`));
        }
      });
    } else {
      logger.warn(colors.bgYellow(`File does not exist: ${fullPath}!`));
    }
  });
};

export { unlinkFile, unlinkFiles };
