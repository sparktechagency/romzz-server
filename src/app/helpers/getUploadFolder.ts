import {
  AUDIO_FIELD_NAMES,
  IMAGE_FIELD_NAMES,
  PDF_FIELD_NAMES,
  VIDEO_FIELD_NAMES,
} from '../constants/file.constant';

// Helper function to determine the upload directory and folder based on fieldname
const getUploadFolder = (fieldname: string) => {
  if (IMAGE_FIELD_NAMES?.includes(fieldname)) {
    return 'images';
  } else if (VIDEO_FIELD_NAMES?.includes(fieldname)) {
    return 'videos';
  } else if (AUDIO_FIELD_NAMES?.includes(fieldname)) {
    return 'audios';
  } else if (PDF_FIELD_NAMES?.includes(fieldname)) {
    return 'pdfs';
  } else {
    return null;
  }
};

export default getUploadFolder;
