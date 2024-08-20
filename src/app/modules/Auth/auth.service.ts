import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import bcrypt from 'bcrypt';
import config from '../../config';
import { IUser } from '../User/user.interface';
import { User } from '../User/user.model';
import { createJwtToken } from '../../helpers/jwtHelpers';
import { JwtPayload } from 'jsonwebtoken';

const loginUserFromDB = async (payload: Partial<IUser>) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(payload?.email as string);

  if (!existingUser) {
    // If no user is found with the given email, throw a NOT_FOUND error
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Check if the user is blocked
  if (existingUser?.isBlocked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is blocked! Access is restricted.',
    );
  }

  // Check if the user is deleted
  if (existingUser?.isDeleted) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is deleted! Please contact support.',
    );
  }

  // Verify the provided password against the stored hashed password
  const isPasswordValid = await User.isPasswordMatched(
    payload?.password as string,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    // If the password does not match, throw a FORBIDDEN error
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid password provided!');
  }

  // Prepare the payload for JWT token generation
  const jwtPayload = {
    id: existingUser?._id,
    email: existingUser?.email,
    role: existingUser?.role,
  };

  // Generate a JWT access token for the authenticated user
  const accessToken = createJwtToken(
    jwtPayload,
    config.jwtAccessSecret as string,
    config.jwtAccessExpiresIn as string,
  );

  return {
    accessToken,
  };
};

const changePasswordIntoDB = async (
  user: JwtPayload,
  payload: { currentPassword: string; newPassword: string },
) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(user?.email);

  // Verify the provided password against the stored hashed password
  const isPasswordValid = await User.isPasswordMatched(
    payload?.currentPassword,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    // If the password does not match, throw a FORBIDDEN error
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid password provided!');
  }

  // Ensure the new password is different from the current password
  const isSamePassword = await User.isPasswordMatched(
    payload?.newPassword,
    existingUser?.password,
  );

  if (isSamePassword) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      'The new password must be different from the current password!',
    );
  }

  // Hash the new password using bcrypt with the configured salt rounds
  const hashPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcryptSaltRounds),
  );

  // Prepare the data to be updated
  const updatedData = {
    password: hashPassword,
    passwordChangedAt: new Date(), // Update the password change timestamp
  };

  const result = await User.findByIdAndUpdate({ _id: user?.id }, updatedData, {
    new: true,
  });
  return result;
};

const forgetPasswordIntoDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

const resetPasswordIntoDB = async (
  token: string,
  payload: IAuthResetPassword,
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication',
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'",
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password',
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!",
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

export const AuthServices = {
  loginUserFromDB,
  changePasswordIntoDB,
};
