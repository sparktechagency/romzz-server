/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IProperty } from './property.interface';
import { Property } from './property.model';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { MAX_PROPERTY_IMAGES } from './property.constant';
import unlinkFile from '../../helpers/unlinkFile';

const createPropertyToDB = async (
  user: JwtPayload,
  payload: IProperty,
  files: any,
) => {
  // Assign the user ID who is creating the property
  payload.createdBy = user?.userId;

  // Set default values for new properties
  payload.status = 'pending';
  payload.isApproved = false;
  payload.isBooked = false;

  // Extract and map the image file paths
  if (files && files?.ownershipImages) {
    payload.ownershipImages = files?.ownershipImages?.map(
      (file: any) => file?.path?.replace(/\\/g, '/'), // Replace backslashes with forward slashes,
    );
  }

  // Extract and map the image file paths
  if (files && files?.propertyImages) {
    payload.propertyImages = files?.propertyImages?.map(
      (file: any) => file?.path?.replace(/\\/g, '/'), // Replace backslashes with forward slashes,
    );
  }

  // Extract and set the video file path
  if (files && files?.propertyVideo) {
    payload.propertyVideo = files['propertyVideo'][0]?.path?.replace(
      /\\/g,
      '/',
    ); // Replace backslashes with forward slashes;
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
    Property.find({ isApproved: true, isBooked: false }).populate({
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

const updatePropertyByIdToDB = async (
  user: JwtPayload,
  propertyId: string,
  files: any,
  payload: Partial<IProperty> & {
    propertyImagesToDelete?: string[];
  },
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
  if (existingProperty.createdBy.toString() !== user.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this property!',
    );
  }

  // Initialize updated lists
  let updatedPropertyImages = existingProperty?.propertyImages || [];

  // Handle deletion of property images
  if (payload?.propertyImagesToDelete) {
    updatedPropertyImages = updatedPropertyImages?.filter(
      (image: string) => !payload?.propertyImagesToDelete?.includes(image),
    );

    // Delete specified images from storage
    for (const propertyImage of payload.propertyImagesToDelete) {
      unlinkFile(propertyImage);
    }
  }

  // Update proof of ownership if new files are provided
  if (files?.propertyImages) {
    const newImages = files?.propertyImages?.map(
      (file: any) => file?.path.replace(/\\/g, '/'), // Replace backslashes with forward slashes
    );

    // Combine existing and new images
    updatedPropertyImages = [...updatedPropertyImages, ...newImages];

    // Ensure the total number of images does not exceed the limit
    if (updatedPropertyImages?.length > MAX_PROPERTY_IMAGES) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `You can only have up to ${MAX_PROPERTY_IMAGES} property images!`,
      );
    }

    // Save the updated property images to the payload
    payload.propertyImages = updatedPropertyImages;
  }

  // Update property video if a new file is provided
  if (files && files?.propertyVideo > 0) {
    const newPropertyVideoPath = files?.propertyVideo[0]?.path.replace(
      /\\/g,
      '/',
    ); // Replace backslashes with forward slashes
    payload.propertyVideo = newPropertyVideoPath;

    if (existingProperty && existingProperty?.propertyVideo) {
      unlinkFile(existingProperty?.propertyVideo);
    }
  }

  // Save new data to the database
  const result = await Property.findByIdAndUpdate(propertyId, payload, {
    new: true,
  });

  return result;
};

export const PropertyServices = {
  createPropertyToDB,
  getAllPropertiesFromDB,
  getApprovedPropertiesFromDB,
  getPropertyByIdFromDB,
  updatePropertyByIdToDB,
};
