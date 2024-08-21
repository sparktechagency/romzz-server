import multer from 'multer';
import path from 'path';
import formatDate from './formatDate';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import createDirectory from './createDirectory';
import {
  AUDIO_FIELD_NAMES,
  FIELD_NAME_TO_FORMATS,
  IMAGE_FIELD_NAMES,
  PDF_FIELD_NAMES,
  VIDEO_FIELD_NAMES,
} from '../constants/file.constant';

// Define the base directory for uploads
const baseUploadDirectory = path.join(process.cwd(), 'uploads');

// Multer storage configuration with readable filenames
const storage = multer.diskStorage({
  // Determine the destination folder based on the file's fieldname
  destination: (req, file, cb) => {
    const { fieldname } = file;
    let uploadDirectory;

    // Choose the appropriate folder based on the file fieldname
    // Check if the fieldname is in IMAGE_FIELD_NAMES
    if (IMAGE_FIELD_NAMES?.includes(fieldname)) {
      uploadDirectory = path.join(baseUploadDirectory, 'images'); // Set directory for image files

      // Check if the fieldname is in VIDEO_FIELD_NAMES
    } else if (VIDEO_FIELD_NAMES?.includes(fieldname)) {
      uploadDirectory = path.join(baseUploadDirectory, 'videos'); // Set directory for video files

      // Check if the fieldname is in AUDIO_FIELD_NAMES
    } else if (AUDIO_FIELD_NAMES?.includes(fieldname)) {
      uploadDirectory = path.join(baseUploadDirectory, 'audios'); // Set directory for audio files

      // Check if the fieldname is in PDF_FIELD_NAMES
    } else if (PDF_FIELD_NAMES?.includes(fieldname)) {
      uploadDirectory = path.join(baseUploadDirectory, 'pdfs'); // Set directory for PDF files

      // If the fieldname does not match any known type
    } else {
      // Throw an error if the file type is not supported
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        'File type is not supported!',
      );
    }

    // Ensure the chosen directory exists
    createDirectory(uploadDirectory);

    // Pass the directory path to Multer
    cb(null, uploadDirectory);
  },

  // Generate a unique filename based on the current date and time
  filename: function (req, file, cb) {
    const formattedDate = formatDate();
    const filename = `${file.fieldname}_${formattedDate}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

// Initialize Multer with the storage configuration and file filter
const upload = multer({
  storage: storage,

  // Filter files based on their mimetype and fieldname
  fileFilter: function (req, file, cb) {
    const { fieldname, mimetype } = file;

    // Retrieve the list of supported formats for the given fieldname
    const supportedFormats = FIELD_NAME_TO_FORMATS[fieldname];

    // Check if the fieldname is valid and has supported formats
    if (supportedFormats) {
      // Check if the file's mimetype is in the list of supported formats
      if (supportedFormats?.includes(mimetype)) {
        return cb(null, true); // Allow the file
      } else {
        // Reject the file if its mimetype is not supported
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          `Unsupported file format for field '${fieldname}'`,
        );
      }
    } else {
      // Reject the file if the fieldname is not recognized
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Unsupported field name '${fieldname}'`,
      );
    }
  },
});

export { storage, upload };
