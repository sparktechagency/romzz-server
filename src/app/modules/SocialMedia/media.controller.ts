import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { MediaServices } from './media.service';
// import { MediaServices } from './Media.service';

const createMedia = catchAsync(async (req, res) => {
  const result = await MediaServices.createMediaToDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Media created successfully!',
    data: result,
  });
});

const getMedias = catchAsync(async (req, res) => {
  const result = await MediaServices.getMediasFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Medias retrieved successfully!',
    data: result,
  });
});

const updateMediaById = catchAsync(async (req, res) => {
  const result = await MediaServices.updateMediaByIdFromDB(
    req?.params?.id,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Media updated successfully!',
    data: result,
  });
});

export const MediaControllers = {
  createMedia,
  getMedias,
  updateMediaById,
};
