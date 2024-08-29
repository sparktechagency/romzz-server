import { Router } from 'express';
import { SliderControllers } from './slider.controller';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { upload } from '../../helpers/uploadConfig';

const router = Router();

router
  .route('/')

  // GET request to fetch all "Slider" entries
  .get(SliderControllers.getSliders)

  // POST request to create a new "Slider" entry
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    upload.single('image'),
    SliderControllers.createSlider,
  );

router
  .route('/:id')

  // PATCH request to update an existing "Slider" entry by its ID
  .patch(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    upload.single('image'),
    SliderControllers.updateSliderById,
  )

  // DELETE request to delete an existing "Slider" entry by its ID
  .delete(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    SliderControllers.deleteSliderById,
  );

export const SliderRoutes = router;
