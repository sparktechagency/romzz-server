/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import stripe from '../../config/stripe';
import { IConnectAccount } from './stripe.interface';
import { User } from '../User/user.model';
import fs from 'fs';
import { UserServices } from '../User/user.service';
import { Property } from '../Property/property.model';
import { Request, Response } from 'express';
import config from '../../config';
import Stripe from 'stripe';
import logger from '../../logger/winston.logger';
import colors from 'colors';
import handleSubscriptionCreated from '../../handlers/handleSubscriptionCreated';
import handleSubscriptionDeleted from '../../handlers/handleSubscriptionDeleted';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  // Extract the Stripe signature from the request header
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripeWebhookSecret as string;

  let event: Stripe.Event | undefined;

  // Verify the authenticity of the event by checking its signature
  try {
    // Stripe expects the raw request body for verification, so avoid parsing it
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    // If the signature verification fails, return a descriptive error
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed. ${error}`,
    );
  }

  // If the event is invalid, return a bad request error
  if (!event) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid event received!');
  }

  // Extract relevant data from the event
  const data = event.data.object as
    | Stripe.Checkout.Session
    | Stripe.Subscription;
  const eventType = event.type;

  // Handle different types of events based on the eventType
  try {
    switch (eventType) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(data);
        break;

      default:
        // Unhandled event type
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error handling event: ${error}`,
    );
  }

  res.sendStatus(200); // Acknowledge receipt of the event
};

const createConnectAccount = async (
  user: JwtPayload,
  payload: IConnectAccount,
  files: any,
) => {
  const { dateOfBirth, address, bank_info } = payload;

  // Find the user based on ID
  const existingUser = await User.findById(user?.userId);

  if (existingUser?.stripeAccountInfo?.accountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User already has a connected Stripe account!',
    );
  }

  // Upload files to Stripe for identity verification
  const [frontFilePart, backFilePart] = await Promise.all(
    files.map((file: any) =>
      stripe.files.create({
        purpose: 'identity_document',
        file: {
          data: fs.readFileSync(file.path),
          name: file.originalname,
          type: file.mimetype,
        },
      }),
    ),
  );

  // Create a Stripe token for the account
  const token = await stripe.tokens.create({
    account: {
      individual: {
        dob: {
          day: new Date(dateOfBirth).getDate(),
          month: new Date(dateOfBirth).getMonth() + 1,
          year: new Date(dateOfBirth).getFullYear(),
        },
        first_name: existingUser?.fullName?.split(' ')[0],
        last_name: existingUser?.fullName?.split(' ')[1],
        email: existingUser?.email,
        phone: existingUser?.phoneNumber,
        address: {
          city: address?.city,
          country: address?.country,
          line1: address?.line1,
          postal_code: address?.postal_code,
        },
        verification: {
          document: {
            front: frontFilePart?.id,
            back: backFilePart?.id,
          },
        },
      },
      business_type: 'individual',
      tos_shown_and_accepted: true,
    },
  });

  // Create a Stripe connected account using the token
  const account = await stripe.accounts.create({
    type: 'custom',
    account_token: token.id,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    external_account: {
      object: 'bank_account',
      account_holder_name: bank_info.account_holder_name,
      account_holder_type: bank_info.account_holder_type,
      account_number: bank_info.account_number,
      routing_number: bank_info.routing_number,
      country: bank_info.country,
      currency: bank_info.currency,
    },
  });

  // // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
    collect: 'eventually_due',
  });

  // Save Stripe account information to the user record
  if (account?.id && accountLink?.url) {
    await User.findByIdAndUpdate(user?.userId, {
      stripeAccountInfo: {
        accountId: account?.id,
        accountDashboardUrl: accountLink?.url,
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
