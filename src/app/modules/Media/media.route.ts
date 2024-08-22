import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { MediaControllers } from './media.controller';

const router = Router();

router
  .route('/')

  .get(MediaControllers.getMedias)
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    MediaControllers.createMedia,
  );

router.patch(
  '/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  MediaControllers.updateMediaById,
);

export const MediaRoutes = router;
