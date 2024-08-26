import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { IFacility } from './facility.interface';
import { Facility } from './facility.model';

const createFacilityToDB = async (payload: IFacility) => {
  const result = await Facility.create(payload);
  return result;
};

const getFacilitiesFromDB = async () => {
  const result = await Facility.find();
  return result;
};

const updateFacilityByIdFromDB = async (
  facilityId: string,
  payload: Partial<IFacility>,
) => {
  // Update the Facility with the provided status
  const result = await Facility.findByIdAndUpdate(facilityId, payload, {
    new: true, // Return the updated document
  });

  // Handle case where no Facility is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Facility with ID: ${facilityId} not found!`,
    );
  }

  return result;
};

const deleteFacilityByIdFromDB = async (facilityId: string) => {
  // Update the Facility with the provided status
  const result = await Facility.findByIdAndDelete(facilityId);

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
