export const IMAGE_FIELD_NAMES = [
  'image',
  'icon',
  'avatar',
  'coverImage',
  'propertyImages',
  'ownershipImages',
];

export const VIDEO_FIELD_NAMES = ['propertyVideo'];
export const AUDIO_FIELD_NAMES = ['audio'];
export const PDF_FIELD_NAMES = ['pdf'];

export const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4'];
export const SUPPORTED_AUDIO_FORMATS = ['audio/mp3'];
export const SUPPORTED_PDF_FORMATS = ['application/pdf'];

// Create a map for field names and their corresponding supported formats
export const FIELD_NAME_TO_FORMATS: { [key: string]: string[] } = {
  image: SUPPORTED_IMAGE_FORMATS,
  icon: SUPPORTED_IMAGE_FORMATS,
  avatar: SUPPORTED_IMAGE_FORMATS,
  coverImage: SUPPORTED_IMAGE_FORMATS,
  propertyImages: SUPPORTED_IMAGE_FORMATS,
  ownershipImages: SUPPORTED_IMAGE_FORMATS,
  propertyVideo: SUPPORTED_VIDEO_FORMATS,
  audio: SUPPORTED_AUDIO_FORMATS,
  pdf: SUPPORTED_PDF_FORMATS,
};
