/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { ISlider } from './slider.interface';
import { Slider } from './slider.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import unlinkFile from '../../helpers/unlinkFile';

const createSliderIntoDB = async (
  user: JwtPayload,
  payload: ISlider,
  file: any,
) => {
  // Check the total number of sliders in the database
  const sliderCount = await Slider.countDocuments();

  // Enforce the global limit of 5 sliders
  if (sliderCount >= 5) {
    throw new ApiError(httpStatus.CONFLICT, 'Slider creation limit reached!');
  }

  payload.createdBy = user?.userId;

  // If a new avatar is uploaded, update the avatar path in the database
  if (file && file?.path) {
    payload.sliderImage = file?.path?.replace(/\\/g, '/'); // Replace backslashes with forward slashes for consistency
  }

  const result = await Slider.create(payload);
  return result;
};

const getSlidersFromDB = async () => {
  const result = await Slider.find();

  return result;
};

const updateSliderByIdFromDB = async (
  sliderId: string,
  payload: Partial<ISlider>,
  file: any,
) => {
  // Fetch the current slider from the database
  const existingSlider = await Slider.findById(sliderId);

  if (!existingSlider) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Slider with ID: ${sliderId} not found!`,
    );
  }

  // If a new image is uploaded, update the sliderImage path
  if (file && file.path) {
    const newSliderImagePath = file.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes for consistency

    // If the slider already has an existing image and it's not the same as the new one, delete the old image file
    if (existingSlider?.sliderImage !== newSliderImagePath) {
      unlinkFile(existingSlider?.sliderImage);
      payload.sliderImage = newSliderImagePath;
    }
  }

  // Update the Slider with the provided status
  const result = await Slider.findByIdAndUpdate(sliderId, payload, {
    new: true, // Return the updated document
  });
  return result;
};

const deleteSliderByIdFromDB = async (sliderId: string) => {
  // Find the Slider by ID
  const result = await Slider.findByIdAndDelete(sliderId);

  // Handle case where no Slider is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Slider with ID: ${sliderId} not found!`,
    );
  }
};

export const SliderServices = {
  createSliderIntoDB,
  getSlidersFromDB,
  updateSliderByIdFromDB,
  deleteSliderByIdFromDB,
};
