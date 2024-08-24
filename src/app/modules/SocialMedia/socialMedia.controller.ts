import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { SocialMediaServices } from './socialMedia.service';

const createSocialMedia = catchAsync(async (req, res) => {
  const result = await SocialMediaServices.createSocialMediaToDB(
    req?.user,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Social Media created successfully!',
    data: result,
  });
});

const getSocialMedias = catchAsync(async (req, res) => {
  const result = await SocialMediaServices.getSocialMediasFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Social Medias retrieved successfully!',
    data: result,
  });
});

const updateSocialMediaById = catchAsync(async (req, res) => {
  const result = await SocialMediaServices.updateSocialMediaByIdFromDB(
    req?.params?.id,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Social Media updated successfully!',
    data: result,
  });
});

export const SocialMediaControllers = {
  createSocialMedia,
  getSocialMedias,
  updateSocialMediaById,
};
