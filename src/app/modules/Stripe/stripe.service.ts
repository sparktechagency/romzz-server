import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import stripe from '../../config/stripe';
import { User } from '../User/user.model';
import { UserServices } from '../User/user.service';
import { Property } from '../Property/property.model';

const createConnectAccount = async (user: JwtPayload) => {
  // Find the user based on ID
  const existingUser = await User.findById(user?.userId);

  if (existingUser?.stripeAccountInfo?.loginUrl) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User already has a connected Stripe account!',
    );
  }

  // Create a Stripe connected account using the token
  const account = await stripe.accounts.create({
    controller: {
      losses: {
        payments: 'application',
      },
      fees: {
        payer: 'application',
      },
      stripe_dashboard: {
        type: 'express',
      },
    },
  });

  // // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
  });

  // Save Stripe account information to the user record
  if (account?.id && accountLink?.url) {
    await User.findByIdAndUpdate(user?.userId, {
      stripeAccountInfo: {
        accountId: account?.id,
      },
    });
  }

  return accountLink;
};

const createPaymentIntent = async (
  user: JwtPayload,
  payload: { propertyId: string },
) => {
  // Calculate user profile progress
  const { progress } =
    await UserServices.calculateUserProfileProgressFromDB(user);

  if (progress < 100) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Complete your profile before booking. Current progress: ${progress}%.`,
    );
  }

  // Find the property based on ID
  const existingProperty = await Property.findById(payload?.propertyId);

  // Ensure the property exists
  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${payload?.propertyId} not found!`,
    );
  }

  // Ensure the property is not already booked
  if (existingProperty?.isBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Property with ID: ${payload?.propertyId} is already booked.`,
    );
  }

  // Find the user who created the property
  const propertyCreator = await User.findById(existingProperty?.createdBy);

  // Ensure the user attempting to book is not the property creator
  if (user?.userId === existingProperty?.createdBy?.toString()) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `You cannot book your own property.`,
    );
  }

  // Ensure the property creator has a connected Stripe account
  if (!propertyCreator?.stripeAccountInfo?.accountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Property creator does not have a connected Stripe account!',
    );
  }

  const amountInCents = Math.round(existingProperty?.price * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    application_fee_amount: amountInCents * 0.2,
    transfer_data: {
      destination: propertyCreator?.stripeAccountInfo?.accountId,
    },
  });

  return paymentIntent?.client_secret;
};

export const StripeServices = {
  createConnectAccount,
  createPaymentIntent,
};
