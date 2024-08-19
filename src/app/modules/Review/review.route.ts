import { Router } from 'express';
import { ReviewControllers } from './review.controller';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';

const router = Router();

router.post(
  '/',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  ReviewControllers.createReview,
);
router.get('/', ReviewControllers.getReviews);

export const ReviewRoutes = router;
