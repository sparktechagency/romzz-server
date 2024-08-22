import { JwtPayload } from 'jsonwebtoken';
import { ISlider } from './slider.interface';
import { Slider } from './slider.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const createSliderIntoDB = async (user: JwtPayload, payload: ISlider) => {
  // Check the total number of sliders in the database
  const sliderCount = await Slider.countDocuments();

  // Enforce the global limit of 5 sliders
  if (sliderCount >= 5) {
    throw new ApiError(httpStatus.CONFLICT, 'Slider creation limit reached!');
  }

  payload.createdBy = user?.userId;

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
) => {
  // Update the Slider with the provided status
  const result = await Slider.findByIdAndUpdate(sliderId, payload, {
    new: true, // Return the updated document
  });

  // Handle case where no Slider is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Slider with ID: ${sliderId} not found!`,
    );
  }

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
