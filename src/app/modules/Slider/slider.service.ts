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

  // If the total number of sliders has reached the limit (5), throw an error
  if (sliderCount >= 5) {
    unlinkFile(file?.path); // Remove the uploaded file to clean up
    throw new ApiError(httpStatus.CONFLICT, 'Slider creation limit reached!');
  }

  // If a file is uploaded, update the image path in the payload
  if (file && file?.path) {
    payload.image = file?.path?.replace(/\\/g, '/'); // Normalize the file path to use forward slashes
  }

  // Set the createdBy field to the ID of the user who is creating the slider
  payload.createdBy = user?.userId;

  // Create the new slider entry in the database
  const result = await Slider.create(payload);
  return result;
};

const getSlidersFromDB = async () => {
  // Fetch all slider entries from the database
  const result = await Slider.find();
  return result;
};

const updateSliderByIdFromDB = async (
  sliderId: string,
  payload: Partial<ISlider>,
  file: any,
) => {
  // Fetch the existing slider entry from the database by its ID
  const existingSlider = await Slider.findById(sliderId);

  // If the slider entry does not exist, throw an error
  if (!existingSlider) {
    unlinkFile(file?.path); // Remove the uploaded file to clean up
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Slider with ID: ${sliderId} not found!`,
    );
  }

  // If a new image is uploaded, update the image path in the payload
  if (file && file?.path) {
    const newImagePath = file?.path?.replace(/\\/g, '/'); // Normalize the file path

    // If a new image file is uploaded, update the image path in the payload
    if (existingSlider?.image !== newImagePath) {
      unlinkFile(existingSlider?.image); // Remove the old image file
      payload.image = newImagePath; // Update the payload with the new image path
    }
  }

  // Prevent modification of the createdBy field to maintain integrity
  delete payload.createdBy;

  // Update the slider entry in the database with the new data
  const result = await Slider.findByIdAndUpdate(sliderId, payload, {
    new: true, // Return the updated document
  });
  return result;
};

const deleteSliderByIdFromDB = async (sliderId: string) => {
  // Delete the slider entry from the database by its ID
  const result = await Slider.findByIdAndDelete(sliderId);

  // If the slider entry does not exist, throw an error
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Slider with ID: ${sliderId} not found!`,
    );
  }

  // If the slider entry has an associated image, remove the image file
  if (result?.image) {
    unlinkFile(result?.image);
  }
};

export const SliderServices = {
  createSliderIntoDB,
  getSlidersFromDB,
  updateSliderByIdFromDB,
  deleteSliderByIdFromDB,
};
