import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { ConversationControllers } from './conversation.controller';

const router = Router();

router
  .route('/')

  .get(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    ConversationControllers.getConversationsByUserId,
  )

  .post(
    validateAuth(USER_ROLE.USER),
    ConversationControllers.createConversation,
  );

router.get(
  '/:id',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  ConversationControllers.getConversationById,
);

export const ConversationRoutes = router;
