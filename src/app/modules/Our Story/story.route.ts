import { Router } from 'express';
import { StoryControllers } from './story.controller';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';

const router = Router();

router
  .route('/')

  .get(StoryControllers.getStories)
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    StoryControllers.createStory,
  );

router
  .route('/:id')

  .patch(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    StoryControllers.updateStoryById,
  );

export const StoryRoutes = router;
