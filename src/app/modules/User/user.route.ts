import { NextFunction, Request, Response, Router } from 'express';
import { UserControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';
import validateAuth from '../../middlewares/validateAuth';
import { upload } from '../../helpers/uploadConfig';
import { USER_ROLE } from './user.constant';

const router = Router();

router.get(
  '/',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  UserControllers.getUsers,
);

router.get(
  '/admins',
  validateAuth(USER_ROLE.superAdmin),
  UserControllers.getAdmins,
);

router.get(
  '/profile',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  UserControllers.getUserProfile,
);

router.get(
  '/favourites',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  UserControllers.getUserFavouritesProperty,
);

router.get('/user-count', UserControllers.getVerifiedUsersCount);
router.get('/user-count/:year', UserControllers.getUserCountByYear);

router.post(
  '/create-user',
  validateRequest(userValidationSchema.createUserSchema),
  UserControllers.createUser,
);

router.post(
  '/create-admin',
  // validateAuth(USER_ROLE.superAdmin),
  validateRequest(userValidationSchema.createAdminSchema),
  UserControllers.createAdmin,
);

router.patch(
  '/update-profile',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.fields([
    { name: 'avatar', maxCount: 1 }, // Single avatar image
    { name: 'coverImage', maxCount: 1 }, // Single cover image
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req?.body?.data);
    next();
  },
  UserControllers.updateUserProfile,
);

export const UserRoutes = router;
