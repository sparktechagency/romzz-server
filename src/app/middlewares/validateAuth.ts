import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { User } from '../modules/User/user.model';
import catchAsync from '../helpers/catchAsync';
import ApiError from '../errors/ApiError';
import { TUserRole } from '../modules/User/user.interface';
import { verifyJwtToken } from '../helpers/jwtHelpers';

const validateAuth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req?.headers?.authorization;

    // checking if the token is missing
    if (!bearerToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    if (bearerToken && bearerToken.startsWith('Bearer')) {
      const token = bearerToken.split(' ')[1];

      // checking if the given token is valid
      const verifyUser = verifyJwtToken(
        token,
        config.jwtAccessSecret as string,
      );

      // Check if a user with the provided email exists in the database
      const existingUser = await User.isUserExistsByEmail(verifyUser?.email);

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

      if (
        existingUser.passwordChangedAt &&
        User.isJWTIssuedBeforePasswordChanged(
          existingUser?.passwordChangedAt,
          verifyUser?.iat as number,
        )
      ) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      if (requiredRoles && !requiredRoles.includes(verifyUser?.role)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      req.user = verifyUser as JwtPayload;
      next();
    }
  });
};

export default validateAuth;
