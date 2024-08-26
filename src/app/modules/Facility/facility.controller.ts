import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FacilityServices } from './facility.service';

const createFacility = catchAsync(async (req, res) => {
  const result = await FacilityServices.createFacilityToDB(req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Facility created successfully!',
    data: result,
  });
});

const getFacilities = catchAsync(async (req, res) => {
  const result = await FacilityServices.getFacilitiesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Facilities retrieved successfully!',
    data: result,
  });
});

const updateFacilityById = catchAsync(async (req, res) => {
  const result = await FacilityServices.updateFacilityByIdFromDB(
    req?.params?.id,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Facility updated successfully!',
    data: result,
  });
});

const deleteFacilityById = catchAsync(async (req, res) => {
  const result = await FacilityServices.deleteFacilityByIdFromDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Facility deleted successfully!',
    data: result,
  });
});

export const FacilityControllers = {
  createFacility,
  getFacilities,
  updateFacilityById,
  deleteFacilityById,
};
