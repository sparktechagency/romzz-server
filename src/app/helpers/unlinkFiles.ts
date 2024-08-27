import fs from 'fs';
import colors from 'colors';
import { errorLogger, logger } from '../utils/winstonLogger';

const unlinkFiles = (files: string[]) => {
  files.forEach((file) => {
    fs.unlink(file, (err) => {
      if (err) {
        errorLogger.error(
          colors.bgRed(`Failed to delete file: ${err?.message}`),
        );
      } else {
        logger.info(colors.bgGreen(`File deleted successfully: ${file}`));
      }
    });
  });
};

export default unlinkFiles;
