import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SliderServices } from './slider.service';

const createSlider = catchAsync(async (req, res) => {
  const result = await SliderServices.createSliderIntoDB(
    req?.user,
    req?.body,
    req?.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Slider created successfully!',
    data: result,
  });
});

const getSliders = catchAsync(async (req, res) => {
  const result = await SliderServices.getSlidersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sliders retrieved successfully!',
    data: result,
  });
});

const updateSliderById = catchAsync(async (req, res) => {
  const result = await SliderServices.updateSliderByIdFromDB(
    req?.params?.id,
    req?.body,
    req?.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slider updated successfully!',
    data: result,
  });
});

const deleteSliderById = catchAsync(async (req, res) => {
  const result = await SliderServices.deleteSliderByIdFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slider deleted successfully!',
    data: result,
  });
});

export const SliderControllers = {
  createSlider,
  getSliders,
  deleteSliderById,
  updateSliderById,
};
