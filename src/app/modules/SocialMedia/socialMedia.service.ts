import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { ISocialMedia } from './socialMedia.interface';
import { SocialMedia } from './socialMedia.model';

const createSocialMediaToDB = async (
  user: JwtPayload,
  payload: ISocialMedia,
) => {
  // Check the total number of SocialMedias in the database
  const SocialmediaCount = await SocialMedia.countDocuments();

  // Enforce the global limit of 4 SocialMedia
  if (SocialmediaCount >= 4) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Social Media creation limit reached!',
    );
  }

  payload.createdBy = user?.userId;

  const result = await SocialMedia.create(payload);
  return result;
};

const getSocialMediasFromDB = async () => {
  const result = await SocialMedia.find();
  return result;
};

const updateSocialMediaByIdFromDB = async (
  SocialmediaId: string,
  payload: Partial<ISocialMedia>,
) => {
  // Remove the createdBy field from the payload
  delete payload.createdBy;

  // Update the SocialMedia with the provided status
  const result = await SocialMedia.findByIdAndUpdate(SocialmediaId, payload, {
    new: true, // Return the updated document
  });

  // Handle case where no SocialMedia is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Social Media with ID: ${SocialmediaId} not found!`,
    );
  }

  return result;
};

export const SocialMediaServices = {
  createSocialMediaToDB,
  getSocialMediasFromDB,
  updateSocialMediaByIdFromDB,
};
