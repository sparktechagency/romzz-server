import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { FaqControllers } from './faq.controller';

const router = Router();

router
  .route('/')

  .get(FaqControllers.getFaqs)
  .post(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    FaqControllers.createFaq,
  );

router
  .route('/:id')

  .patch(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    FaqControllers.updateFaqById,
  )
  .delete(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    FaqControllers.deleteFaqById,
  );

export const FaqRoutes = router;
