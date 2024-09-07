import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { SocialMediaControllers } from './socialMedia.controller';

const router = Router();

router
  .route('/')

  .get(SocialMediaControllers.getSocialMedias)
  .post(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    SocialMediaControllers.createSocialMedia,
  );

router.patch(
  '/:id',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  SocialMediaControllers.updateSocialMediaById,
);

export const MediaRoutes = router;
