import { Router } from 'express';
import { UserControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userRegistrationValidationSchema } from './user.validation';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from './user.constant';

const router = Router();

router.post(
  '/create-user',
  validateRequest(userRegistrationValidationSchema),
  UserControllers.createUser,
);
router.post(
  '/create-admin',
  validateRequest(userRegistrationValidationSchema),
  UserControllers.createAdmin,
);

router.get('/', UserControllers.getUsers);
router.get(
  '/profile',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  UserControllers.getUserProfile,
);

export const UserRoutes = router;
