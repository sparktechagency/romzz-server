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

  // Validate the user
  const existingUser = await User.findById(user?.userId);

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User with ID: ${user?.userId} not found!`,
    );
  }

  // Check if an account already exists for the user
  if (existingUser?.stripeAccountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account already exists!');
  }

  // Validate files
  if (!files || files?.length < 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Two KYC files required!');
  }

  // Upload files to Stripe
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

  // Create a Stripe connected account
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
      country: bank_info.country,
      currency: bank_info.currency,
    },
  });

  // Save the connected account information to the user record
  // if (account.id && account.external_accounts.data.length) {
  //   isExistUser.accountInformation.stripeAccountId = account.id;
  //   isExistUser.accountInformation.externalAccountId =
  //     account.external_accounts.data[0].id;
  //   isExistUser.accountInformation.status = true;
  //   isExistUser.bank_account = bank_info.account_number;
  //   await isExistUser.save();
  // }

  // // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
    collect: 'eventually_due',
  });

  return accountLink;
};

export const StripeServices = {
  createConnectAccount,
};
