/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IProperty } from './property.interface';
import { Property } from './property.model';

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

export const PropertyServices = {
  createPropertyIntoDB,
};
