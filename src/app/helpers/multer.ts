import multer from 'multer';
import path from 'path';
import formatDate from './formatDate';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

// Multer storage configuration with readable filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, 'uploads/images/');
    } else if (file.mimetype.startsWith('video')) {
      cb(null, 'uploads/videos/');
    } else {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'File is not supported');
    }
  },
  filename: function (req, file, cb) {
    const formattedDate = formatDate();
    const filename = `${file.fieldname}_${formattedDate}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

// Initialize Multer with the storage configuration
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype.startsWith('image') ||
      file.mimetype.startsWith('video')
    ) {
      cb(null, true);
    } else {
      cb(new ApiError('Only images and videos are allowed!'), false);
    }
  },
});

export { upload };
