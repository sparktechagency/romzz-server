import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';

const getPathAfterUploads = (fullPath: string) => {
  // Normalize path to use forward slashes
  const normalizedPath = fullPath?.replace(/\\/g, '/');

  // Find the index of 'uploads' in the normalized path
  const uploadsIndex = normalizedPath?.indexOf('uploads');

  if (uploadsIndex === -1) {
    // Throw an error if "uploads" is not found in the path
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "'uploads' directory not found in the provided path.",
    );
  }

  // Add length of 'uploads' + 1 to the index to start after 'uploads/'
  return normalizedPath?.substring(uploadsIndex + 'uploads'.length + 1);
};

export default getPathAfterUploads;
