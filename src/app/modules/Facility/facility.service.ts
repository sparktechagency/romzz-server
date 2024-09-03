/* eslint-disable @typescript-eslint/no-explicit-any */

import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { IFacility } from './facility.interface';
import { Facility } from './facility.model';
import { unlinkFile } from '../../helpers/fileHandler';
import getPathAfterUploads from '../../helpers/getPathAfterUploads';

const createFacilityToDB = async (payload: IFacility, file: any) => {
  if (file && file?.path) {
    payload.icon = getPathAfterUploads(file?.path);
  }

  const result = await Facility.create(payload);
  return result;
};

const getFacilitiesFromDB = async () => {
  const result = await Facility.find();
  return result;
};

const updateFacilityByIdFromDB = async (
  facilityId: string,
  payload: IFacility,
  file: any,
) => {
  // Fetch the existing facility entry from the database by its ID
  const existingFacility = await Facility.findById(facilityId);

  // If the Facility entry does not exist, throw an error
  if (!existingFacility) {
    unlinkFile(file?.path); // Remove the uploaded file to clean up
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Facility with ID: ${facilityId} not found!`,
    );
  }

  // If a new image is uploaded, update the image path in the payload
  if (file && file?.path) {
    const newImagePath = getPathAfterUploads(file?.path);

    // If a new image file is uploaded, update the image path in the payload
    if (existingFacility?.icon !== newImagePath) {
      payload.icon = newImagePath; // Update the payload with the new image path
      unlinkFile(existingFacility?.icon); // Remove the old image file
    }
  }

  // Update the Facility with the provided status
  const result = await Facility.findByIdAndUpdate(facilityId, payload, {
    new: true, // Return the updated document
    runValidators: true,
  });

  return result;
};

const deleteFacilityByIdFromDB = async (facilityId: string) => {
  // Update the Facility with the provided status
  const result = await Facility.findByIdAndDelete(facilityId);

  // If the facility entry has an associated image, remove the image file
  if (result?.icon) {
    unlinkFile(result?.icon);
  }

  // Handle case where no Facility is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Facility with ID: ${facilityId} not found!`,
    );
  }
};

export const FacilityServices = {
  createFacilityToDB,
  getFacilitiesFromDB,
  updateFacilityByIdFromDB,
  deleteFacilityByIdFromDB,
};
