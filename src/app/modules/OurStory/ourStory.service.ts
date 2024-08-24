/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { IOurStory } from './ourStory.interface';
import { OurStory } from './ourStory.model';
import unlinkFile from '../../helpers/unlinkFile';

const createOurStoryToDB = async (
  user: JwtPayload,
  payload: IOurStory,
  file: any,
) => {
  // Check the total number of "Our Story" in the database
  const OurstoryCount = await OurStory.countDocuments();

  // Enforce the global limit of 1 "Our Story"
  if (OurstoryCount >= 1) {
    unlinkFile(file?.path); // Delete the uploaded file if the creation limit is reached
    throw new ApiError(
      httpStatus.CONFLICT,
      'Our Story creation limit reached!',
    );
  }

  // Set the createdBy field to the ID of the user who is creating the story
  payload.createdBy = user?.userId;

  // If a new image is uploaded, update the image path in the payload
  if (file && file?.path) {
    payload.image = file?.path?.replace(/\\/g, '/'); // Replace backslashes with forward slashes for consistency
  }

  // Create the new "Our Story" entry in the database
  const result = await OurStory.create(payload);
  return result;
};

const getOurStoriesFromDB = async () => {
  // Fetch all "Our Story" entries from the database
  const result = await OurStory.find();
  return result;
};

const updateOurStoryByIdFromDB = async (
  ourStoryId: string,
  payload: Partial<IOurStory>,
  file: any,
) => {
  // Fetch the current "Our Story" entry from the database by its ID
  const existingOurStory = await OurStory.findById(ourStoryId);

  // Throw an error if the "Our Story" entry is not found
  if (!existingOurStory) {
    unlinkFile(file?.path); // Delete the uploaded file if the entry is not found
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Our Story with ID: ${ourStoryId} not found!`,
    );
  }

  // If a new image is uploaded, update the image path in the payload
  if (file && file?.path) {
    const newImagePath = file?.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes for consistency

    // If the "Our Story" entry already has an existing image and it's not the same as the new one, delete the old image file
    if (existingOurStory?.image !== newImagePath) {
      unlinkFile(existingOurStory?.image);
      payload.image = newImagePath;
    }
  }

  // Remove the createdBy field from the payload to prevent updates to this field
  delete payload.createdBy;

  // Update the "Our Story" entry with the provided data and return the updated document
  const result = await OurStory.findByIdAndUpdate(ourStoryId, payload, {
    new: true, // Return the updated document
  });

  return result;
};

export const OurStoryServices = {
  createOurStoryToDB,
  getOurStoriesFromDB,
  updateOurStoryByIdFromDB,
};
