import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { ContactControllers } from './contact.controller';

const router = Router();

router
  .route('/')

  .get(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    ContactControllers.getUserEmailList,
  )
  .post(ContactControllers.saveUserEmail);

export const ContactRoutes = router;
