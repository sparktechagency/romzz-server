import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { MessageControllers } from './message.controller';

const router = Router();

router
  .route('/:conversationId')

  .post(
    validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    MessageControllers.createMessage,
  );

export const MessageRoutes = router;
