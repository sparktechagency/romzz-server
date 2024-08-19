import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import bcrypt from 'bcrypt';
import config from '../../config';
import { IUser } from '../User/user.interface';
import { User } from '../User/user.model';
import { createJwtToken } from '../../helpers/jwtHelpers';

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
      'User account is blocked. Access is restricted.',
    );
  }

  // Check if the user is deleted
  if (existingUser?.isDeleted) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is deleted. Please contact support.',
    );
  }

  // Verify the provided password against the stored hashed password
  const isPasswordValid = await bcrypt.compare(
    payload?.password as string,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    // If the password does not match, throw a FORBIDDEN error
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid password provided!');
  }

  // Prepare the payload for JWT token generation
  const jwtPayload = {
    _id: existingUser?._id,
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

export const UserServices = {
  loginUserFromDB,
};
