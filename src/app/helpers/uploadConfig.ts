import multer from 'multer';
import path from 'path';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import createDirectory from './createDirectory';
import { FIELD_NAME_TO_FORMATS } from '../constants/file.constant';
import getUploadFolder from './getUploadFolder';
import { unlinkFiles } from './fileHandler';

// Base directory for uploads
const baseUploadDirectory = path.join(process.cwd(), 'uploads');

// Track uploaded files for cleanup
const uploadedFiles: string[] = [];

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { fieldname } = file;
    // Determine upload folder based on fieldname
    const uploadFolder = getUploadFolder(fieldname);

    if (!uploadFolder) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        'File type is not supported!',
      );
    }

    const uploadDirectory = path.join(baseUploadDirectory, uploadFolder);

    createDirectory(uploadDirectory); // Ensure directory exists
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName =
      file.fieldname + '-' + uniqueSuffix + path.extname(file?.originalname);

    const filePath = path.join(
      baseUploadDirectory,
      getUploadFolder(file?.fieldname) as string,
      fileName,
    );
    uploadedFiles.push(filePath); // Track file for potential cleanup
    cb(null, fileName);
  },
});

// Multer upload configuration
const upload = multer({
  storage: storage,

  fileFilter: function (req, file, cb) {
    const { fieldname, mimetype } = file;

    // Retrieve the list of supported formats for the given fieldname
    const supportedFormats = FIELD_NAME_TO_FORMATS[fieldname];

    if (supportedFormats) {
      if (supportedFormats?.includes(mimetype)) {
        uploadedFiles.length = 0; // Clear the list for next batch
        return cb(null, true);
      } else {
        unlinkFiles(uploadedFiles);
        uploadedFiles.length = 0; // Remove all uploaded files if error
        return cb(
          new ApiError(
            httpStatus.NOT_ACCEPTABLE,
            `Unsupported file format for field: '${fieldname}'`,
          ),
        );
      }
    } else {
      unlinkFiles(uploadedFiles);
      uploadedFiles.length = 0; // Remove all uploaded files if error
      return cb(
        new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          `Unsupported field name: '${fieldname}'`,
        ),
      );
    }
  },
});

export { storage, upload };
