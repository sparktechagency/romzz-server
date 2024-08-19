import { Router } from 'express';
import { UserControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userRegistrationValidationSchema } from './user.validation';

const router = Router();

router.get('/', UserControllers.getUsers);

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

export const UserRoutes = router;
