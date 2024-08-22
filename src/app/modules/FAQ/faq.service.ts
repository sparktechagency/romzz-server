import { JwtPayload } from 'jsonwebtoken';
import { IFaq } from './faq.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Faq } from './faq.model';

const createFaqIntoDB = async (user: JwtPayload, payload: IFaq) => {
  payload.createdBy = user?.userId;

  const result = await Faq.create(payload);
  return result;
};

const getFaqsFromDB = async () => {
  const result = await Faq.find();
  return result;
};

const updateFaqByIdFromDB = async (faqId: string, payload: Partial<IFaq>) => {
  // Update the Faq with the provided status
  const result = await Faq.findByIdAndUpdate(faqId, payload, {
    new: true, // Return the updated document
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

export const FaqServices = {
  createFaqIntoDB,
  getFaqsFromDB,
  updateFaqByIdFromDB,
};
