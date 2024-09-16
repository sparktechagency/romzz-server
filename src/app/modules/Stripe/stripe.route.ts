import { NextFunction, Request, Response, Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { upload } from '../../helpers/uploadConfig';
import { StripeControllers } from './stripe.controller';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const router = Router();

router.post(
  '/connect-account',
  validateAuth(USER_ROLE.USER),
  upload.array('KYC', 2),
  (req: Request, res: Response, next: NextFunction) => {
    // Check if 'data' exists in req.body before parsing
    if (!req.body || !req?.body?.data) {
      return next(
        new ApiError(httpStatus.BAD_REQUEST, 'No body data provided!'),
      );
    }

    // Parse 'data' from body if it exists
    try {
      req.body = JSON.parse(req?.body?.data);
    } catch (error) {
      return next(
        new ApiError(httpStatus.BAD_REQUEST, `Invalid JSON data: ${error}`),
      );
    }

    // Check if files are provided and if the correct number of files are uploaded
    if (!req.files || (req.files as Express.Multer.File[]).length < 2) {
      return next(
        new ApiError(httpStatus.BAD_REQUEST, 'Two KYC files are required!'),
      );
    }

    next();
  },

  StripeControllers.createConnectAccount,
);

export const StripeRoutes = router;
