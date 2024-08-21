/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IProperty } from './property.interface';
import { Property } from './property.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createPropertyIntoDB = async (
  user: JwtPayload,
  files: any,
  payload: IProperty,
) => {
  // Assign the user ID who is creating the property
  payload.createdBy = user?.userId;

  // Set default values for new properties
  payload.status = 'pending'; // Set the status to 'pending'
  payload.isApproved = false; // Set the isApproved status to false
  payload.isBooked = false; // Set the isApproved status to false

  // Extract and map the image file paths
  if (files['proofOfOwnership']) {
    payload.proofOfOwnership = files['proofOfOwnership'].map(
      (file: any) => file?.path,
    );
  }

  // Extract and map the image file paths
  if (files['propertyImages']) {
    payload.propertyImages = files['propertyImages'].map(
      (file: any) => file?.path,
    );
  }

  // Extract and set the video file path
  if (files['propertyVideo'] && files['propertyVideo'][0]) {
    payload.propertyVideo = files['propertyVideo'][0].path;
  }

  // Create the property in the database
  const result = await Property.create(payload);
  return result;
};

const getApprovedPropertiesFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const propertiesQuery = new QueryBuilder(
    Property.find({ isApproved: true }).populate({
      path: 'createdBy',
      select: 'fullName email avatar',
    }),
    query,
  )
    // .search() // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await propertiesQuery.countTotal();
  // Execute the query to retrieve the reviews
  const result = await propertiesQuery.modelQuery;

  return { meta, result };
};

export const PropertyServices = {
  createPropertyIntoDB,
  getApprovedPropertiesFromDB,
};
