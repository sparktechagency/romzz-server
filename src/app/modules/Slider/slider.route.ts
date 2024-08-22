import { Router } from 'express';
import { SliderControllers } from './slider.controller';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { upload } from '../../helpers/multer';

const router = Router();

router
  .route('/')

  .get(SliderControllers.getSliders)
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    upload.single('sliderImage'),
    SliderControllers.createSlider,
  );

router
  .route('/:id')

  .patch(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    upload.single('sliderImage'),
    SliderControllers.updateSliderById,
  )
  .delete(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    SliderControllers.deleteSliderById,
  );

export const SliderRoutes = router;
