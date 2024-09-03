import { Router } from 'express';
import { USER_ROLE } from '../User/user.constant';
import { FeedbackControllers } from './feedback.controller';
import validateAuth from '../../middlewares/validateAuth';
import { upload } from '../../helpers/uploadConfig';

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
    upload.single('image'),
    FeedbackControllers.createFeedback,
  );

// Route to get only visible feedbacks
router.get('/visible', FeedbackControllers.getVisibleFeedbacks);

router.get('/:userId', FeedbackControllers.getUserProfileFeedbacks);

router.get(
  '/summary/:userId',
  FeedbackControllers.getUserProfileFeedbackSummary,
);

// Route to update feedback visibility status
router.patch(
  '/update-status/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  FeedbackControllers.updateFeedbackVisibilityStatus,
);

export const FeedbackRoutes = router;
