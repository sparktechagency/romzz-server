/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import stripe from '../../config/stripe';
import { IConnectAccount } from './stripe.interface';
import { User } from '../User/user.model';
import fs from 'fs';

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

export const StripeServices = {
  createConnectAccount,
};
