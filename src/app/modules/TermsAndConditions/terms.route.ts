import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { TermsControllers } from './terms.controller';

const router = Router();

router
  .route('/')

  .get(TermsControllers.getTerms)
  .post(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    TermsControllers.createTerms,
  );

router.patch(
  '/:id',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  TermsControllers.updateTermsById,
);

export const TermsRoutes = router;
