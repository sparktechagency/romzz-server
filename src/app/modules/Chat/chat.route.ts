import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { ChatControllers } from './chat.controller';

const router = Router();

router
  .route('/')

  .get(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    ChatControllers.getChats,
  )

  .post(validateAuth(USER_ROLE.USER), ChatControllers.createChat);

router.patch(
  '/:id',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  ChatControllers.getChatById,
);

export const ChatRoutes = router;
