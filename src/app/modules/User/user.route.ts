import { NextFunction, Request, Response, Router } from 'express';
import { UserControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';
import validateAuth from '../../middlewares/validateAuth';
import { upload } from '../../helpers/uploadConfig';
import { USER_ROLE } from './user.constant';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const router = Router();

router.get(
  '/',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  UserControllers.getUsers,
);

router.post(
  '/create-user',
  validateRequest(userValidationSchema.createUserSchema),
  UserControllers.createUser,
);

router.post(
  '/create-admin',
  validateAuth(USER_ROLE['SUPER-ADMIN']),
  validateRequest(userValidationSchema.createAdminSchema),
  UserControllers.createAdmin,
);

router.get(
  '/admins',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  UserControllers.getAdmins,
);

router.get(
  '/profile',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  UserControllers.getUserProfile,
);

router.patch(
  '/update-profile',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  upload.fields([
    { name: 'avatar', maxCount: 1 }, // Single avatar image
    { name: 'coverImage', maxCount: 1 }, // Single cover image
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    // Check if 'data' exists in req.body before parsing
    if (req?.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (error) {
        return new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid JSON data: ${error}`,
        );
      }
    }

    next();
  },
  UserControllers.updateUserProfile,
);

router.get(
  '/profile/:id',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  UserControllers.getUserProfileById,
);

router.get('/partial-profile/:id', UserControllers.getPartialUserProfileById);

// Route to update user status to block or unblock
router.patch(
  '/update-status/:id',
  validateAuth(USER_ROLE['SUPER-ADMIN']),
  UserControllers.toggleUserStatus,
);

router.get(
  '/profile-progress',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  UserControllers.getUserProfileProgress,
);

router.get(
  '/favourite-properties',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  UserControllers.getUserFavouriteProperties,
);

export const UserRoutes = router;
