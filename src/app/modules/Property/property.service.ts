/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IProperty } from './property.interface';
import { Property } from './property.model';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { propertyFieldsToExclude } from './property.constant';

const createPropertyIntoDB = async (
  user: JwtPayload,
  payload: IProperty,
  files: any,
) => {
  // Assign the user ID who is creating the property
  payload.createdBy = user?.userId;

  // Set default values for new properties
  payload.status = 'pending'; // Set the status to 'pending'
  payload.isApproved = false; // Set the isApproved status to false
  payload.isBooked = false; // Set the isApproved status to false

  // Extract and map the image file paths
  if (files['proofOfOwnership']) {
    payload.proofOfOwnership = files['proofOfOwnership']?.map(
      (file: any) => file?.path,
    );
  }

  // Extract and map the image file paths
  if (files['propertyImages']) {
    payload.propertyImages = files['propertyImages']?.map(
      (file: any) => file?.path,
    );
  }

  // Extract and set the video file path
  if (files['propertyVideo'] && files['propertyVideo'][0]) {
    payload.propertyVideo = files['propertyVideo'][0]?.path;
  }

  // Create the property in the database
  const result = await Property.create(payload);
  return result;
};

const getAllPropertiesFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const propertiesQuery = new QueryBuilder(
    Property.find().populate({
      path: 'createdBy',
      select: 'fullName email phoneNumber avatar',
    }),
    query,
  )
    .search(['address']) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await propertiesQuery.countTotal();

  // Execute the query to retrieve the reviews
  const result = await propertiesQuery.modelQuery;

  return { meta, result };
};

const getApprovedPropertiesFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const propertiesQuery = new QueryBuilder(
    Property.find({ isApproved: true }).populate({
      path: 'createdBy',
      select: 'avatar',
    }),
    query,
  )
    .search(['address']) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await propertiesQuery.countTotal();

  // Execute the query to retrieve the reviews
  const result = await propertiesQuery.modelQuery;

  return { meta, result };
};

const getPropertyByIdFromDB = async (propertyId: string) => {
  // Find the Review by ID and populate the userId field
  const result = await Property.findById(propertyId).populate({
    path: 'createdBy',
    select: 'fullName avatar',
  });

  // Handle the case where the review is not found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  return result;
};

const updatePropertyByIdIntoDB = async (
  user: JwtPayload,
  propertyId: string,
  files: any,
  payload: Partial<IProperty>,
) => {
  // Find the existing property
  const existingProperty = await Property.findById(propertyId);

  // Handle case where property is not found
  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  // Ensure the user trying to update the property is the creator
  if (existingProperty?.createdBy !== user?.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this property!',
    );
  }

  // Filter out these fields from the payload
  propertyFieldsToExclude.forEach((field) => delete payload[field]);

  const result = await Property.findByIdAndUpdate(propertyId, payload, {
    new: true,
  });

  return result;
};

export const PropertyServices = {
  createPropertyIntoDB,
  getAllPropertiesFromDB,
  getApprovedPropertiesFromDB,
  getPropertyByIdFromDB,
  updatePropertyByIdIntoDB,
};
