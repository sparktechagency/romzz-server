import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { OurStoryControllers } from './ourStory.controller';
import { upload } from '../../helpers/uploadConfig';

const router = Router();

router
  .route('/')

  // GET request to fetch all "Our Story" entries
  .get(OurStoryControllers.getOurStory)

  // POST request to create a new "Our Story" entry
  .post(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    upload.single('image'),
    OurStoryControllers.createOurStory,
  );

// PATCH request to update an existing "Our Story" entry by its ID
router.patch(
  '/:id',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  upload.single('image'),
  OurStoryControllers.updateOurStoryById,
);

export const OurStoryRoutes = router;
