import multer from 'multer';
import fs from 'fs';
import path from 'path';
import formatDate from './formatDate';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import createDirectory from './createDirectory';

// Define the base directory for uploads
const baseUploadDirectory = path.join(process.cwd(), 'uploads');

// Create the base upload directory if it doesn't exist
if (!fs.existsSync(baseUploadDirectory)) {
  fs.mkdirSync(baseUploadDirectory);
}

// Multer storage configuration with readable filenames
const storage = multer.diskStorage({
  // Determine the destination folder based on the file's fieldname
  destination: (req, file, cb) => {
    let uploadDirectory;

    // Choose the appropriate folder based on the file type
    switch (file?.fieldname) {
      case 'image':
        uploadDirectory = path.join(baseUploadDirectory, 'images');
        break;
      case 'video':
        uploadDirectory = path.join(baseUploadDirectory, 'videos');
        break;
      case 'audio':
        uploadDirectory = path.join(baseUploadDirectory, 'audios');
        break;
      case 'pdf':
        uploadDirectory = path.join(baseUploadDirectory, 'pdfs');
        break;
      default:
        // If the file type is unsupported, throw an error
        throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'File is not supported');
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
    // Validate image files
    if (file.fieldname === 'image') {
      if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png'
      ) {
        cb(null, true);
      } else {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          'Only .jpeg, .png, .jpg format is supported!',
        );
      }
    }

    // Validate video files
    else if (file.fieldname === 'video') {
      if (file.mimetype === 'video/mp4') {
        cb(null, true);
      } else {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          'Only .mp4 format is supported!',
        );
      }
    }

    // Validate audio files
    else if (file.fieldname === 'audio') {
      if (file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          'Only .mp3 format is supported!',
        );
      }
    }

    // Validate pdf files
    else if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          'Only .pdf format is supported!',
        );
      }
    }

    // Reject any other file types
    else {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        'This file is not supported',
      );
    }
  },
});

export { storage, upload };
