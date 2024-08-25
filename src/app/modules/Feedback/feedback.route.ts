import { Router } from 'express';
import { USER_ROLE } from '../User/user.constant';
import { FeedbackControllers } from './feedback.controller';
import validateAuth from '../../middlewares/validateAuth';

const router = Router();

// Route to get all feedbacks or create a new feedback
router
  .route('/')

  .get(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    FeedbackControllers.getAllFeedbacks,
  )
  .post(
    validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
    FeedbackControllers.createFeedback,
  );

// Route to get only visible feedbacks
router.get('/visible', FeedbackControllers.getVisibleFeedbacks);

router.get('/:userId', FeedbackControllers.getUserProfileFeedbacks);

router.get(
  '/summary/:userId',
  FeedbackControllers.getUserProfileFeedbackSummary,
);

// Route to update feedback visibility to "show"
router.patch(
  '/show/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  FeedbackControllers.updateFeedbackStatusToShow,
);

// Route to update feedback visibility to "hide"
router.patch(
  '/hide/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  FeedbackControllers.updateFeedbackStatusToHide,
);

export const FeedbackRoutes = router;
