import { Router } from 'express';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/validateAuth';
import { FeedbackControllers } from './feedback.controller';

const router = Router();

router
  .route('/')

  .get(
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    FeedbackControllers.getAllFeedbacks,
  )
  .post(
    auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
    FeedbackControllers.createFeedback,
  );

router.get('/visible', FeedbackControllers.getVisibleFeedbacks);

router.patch(
  'show/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  FeedbackControllers.updateFeedbackStatusToShow,
);
router.patch(
  'hide/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  FeedbackControllers.updateFeedbackStatusToHide,
);

export const FeedbackRoutes = router;
