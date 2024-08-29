/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { IOurStory } from './ourStory.interface';
import { OurStory } from './ourStory.model';
import { unlinkFile } from '../../helpers/fileHandler';

const createOurStoryToDB = async (
  user: JwtPayload,
  payload: IOurStory,
  file: any,
) => {
  // Check the total number of our stories in the database
  const ourstoryCount = await OurStory.countDocuments();

  // If the total number of sliders has reached the limit (5), throw an error
  if (ourstoryCount >= 1) {
    unlinkFile(file?.path); // Remove the uploaded file to clean up
    throw new ApiError(
      httpStatus.CONFLICT,
      'Our Story creation limit reached!',
    );
  }

  // If a new image is uploaded, update the image path in the payload
  if (file && file?.path) {
    payload.image = file?.path?.replace(/\\/g, '/'); // Normalize the file path to use forward slashes
  }

  // Set the createdBy field to the ID of the user who is creating the our story
  payload.createdBy = user?.userId;

  // Create the new our story entry in the database
  const result = await OurStory.create(payload);
  return result;
};

const getOurStoryFromDB = async () => {
  // Fetch all our stories entries from the database
  const result = await OurStory.find();
  return result;
};

const updateOurStoryByIdFromDB = async (
  ourStoryId: string,
  payload: Partial<IOurStory>,
  file: any,
) => {
  // Fetch the existing our stories entry from the database by its ID
  const existingOurStory = await OurStory.findById(ourStoryId);

  // If the our story entry does not exist, throw an error
  if (!existingOurStory) {
    unlinkFile(file?.path); // Remove the uploaded file to clean up
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Our Story with ID: ${ourStoryId} not found!`,
    );
  }

  // If a new image is uploaded, update the image path in the payload
  if (file && file?.path) {
    const newImagePath = file?.path?.replace(/\\/g, '/'); // Normalize the file path

    // If a new image file is uploaded, update the image path in the payload
    if (existingOurStory?.image !== newImagePath) {
      unlinkFile(existingOurStory?.image); // Remove the old image file
      payload.image = newImagePath; // Update the payload with the new image path
    }
  }

  // Prevent modification of the createdBy field to maintain integrity
  delete payload.createdBy;

  // Update the our story entry in the database with the new data
  const result = await OurStory.findByIdAndUpdate(ourStoryId, payload, {
    new: true, // Return the updated document
    runValidators: true,
  });

  return result;
};

export const OurStoryServices = {
  createOurStoryToDB,
  getOurStoryFromDB,
  updateOurStoryByIdFromDB,
};
