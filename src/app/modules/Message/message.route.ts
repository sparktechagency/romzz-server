import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { MessageControllers } from './message.controller';

const router = Router();

router
  .route('/')

  .get(MessageControllers.getMessages)
  .post(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    MessageControllers.createMessage,
  );

router.route('/:id');

export const MessageRoutes = router;
