import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { TermsControllers } from './terms.controller';

const router = Router();

router
  .route('/')

  .get(TermsControllers.getTerms)
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    TermsControllers.createTerms,
  );

router.patch(
  '/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  TermsControllers.updateTermsById,
);

export const TermsRoutes = router;
