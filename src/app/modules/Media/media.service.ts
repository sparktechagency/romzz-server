import { JwtPayload } from 'jsonwebtoken';
import { IMedia } from './media.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Media } from './media.model';

const createMediaToDB = async (user: JwtPayload, payload: IMedia) => {
  // Check the total number of Medias in the database
  const mediaCount = await Media.countDocuments();

  // Enforce the global limit of 4 Media
  if (mediaCount >= 4) {
    throw new ApiError(httpStatus.CONFLICT, 'Media creation limit reached!');
  }

  payload.createdBy = user?.userId;

  const result = await Media.create(payload);
  return result;
};

const getMediasFromDB = async () => {
  const result = await Media.find();
  return result;
};

const updateMediaByIdFromDB = async (
  mediaId: string,
  payload: Partial<IMedia>,
) => {
  // Remove the createdBy field from the payload
  delete payload.createdBy;

  // Update the Media with the provided status
  const result = await Media.findByIdAndUpdate(mediaId, payload, {
    new: true, // Return the updated document
  });

  // Handle case where no Media is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Media with ID: ${mediaId} not found!`,
    );
  }

  return result;
};

export const MediaServices = {
  createMediaToDB,
  getMediasFromDB,
  updateMediaByIdFromDB,
};
