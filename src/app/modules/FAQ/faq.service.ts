import { JwtPayload } from 'jsonwebtoken';
import { IFaq } from './faq.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Faq } from './faq.model';

const createFaqToDB = async (user: JwtPayload, payload: IFaq) => {
  payload.createdBy = user?.userId;

  const result = await Faq.create(payload);
  return result;
};

const getFaqsFromDB = async () => {
  const result = await Faq.find();
  return result;
};

const updateFaqByIdFromDB = async (faqId: string, payload: Partial<IFaq>) => {
  // Remove the createdBy field from the payload
  delete payload.createdBy;

  // Update the Faq with the provided status
  const result = await Faq.findByIdAndUpdate(faqId, payload, {
    new: true, // Return the updated document
    runValidators: true,
  });

  // Handle case where no Faq is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Faq with ID: ${faqId} not found!`,
    );
  }

  return result;
};

const deleteFaqByIdFromDB = async (faqId: string) => {
  const result = await Faq.findByIdAndDelete(faqId);

  // Handle case where no Faq is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Faq with ID: ${faqId} not found!`,
    );
  }
};

export const FaqServices = {
  createFaqToDB,
  getFaqsFromDB,
  updateFaqByIdFromDB,
  deleteFaqByIdFromDB,
};
