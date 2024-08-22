import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { FaqControllers } from './faq.controller';

const router = Router();

router
  .route('/')

  .get(FaqControllers.getFaqs)
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    FaqControllers.createFaq,
  );

router
  .route('/:id')

  .patch(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    FaqControllers.updateFaqById,
  )
  .delete(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    FaqControllers.deleteFaqById,
  );

export const FaqRoutes = router;
