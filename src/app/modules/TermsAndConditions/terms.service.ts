import { JwtPayload } from 'jsonwebtoken';
import { ITerms } from './terms.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Terms } from './terms.model';

const createTermsToDB = async (user: JwtPayload, payload: ITerms) => {
  // Check the total number of Termss in the database
  const termsCount = await Terms.countDocuments();

  // Enforce the global limit of 1 Terms
  if (termsCount >= 1) {
    throw new ApiError(httpStatus.CONFLICT, 'Terms creation limit reached!');
  }

  payload.createdBy = user?.userId;

  const result = await Terms.create(payload);
  return result;
};

const getTermsFromDB = async () => {
  const result = await Terms.find();
  return result;
};

const updateTermsByIdFromDB = async (
  termsId: string,
  payload: Partial<ITerms>,
) => {
  // Remove the createdBy field from the payload
  delete payload.createdBy;

  // Update the Terms with the provided status
  const result = await Terms.findByIdAndUpdate(termsId, payload, {
    new: true, // Return the updated document
  });

  // Handle case where no Terms is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Terms with ID: ${termsId} not found!`,
    );
  }

  return result;
};

export const TermsServices = {
  createTermsToDB,
  getTermsFromDB,
  updateTermsByIdFromDB,
};
