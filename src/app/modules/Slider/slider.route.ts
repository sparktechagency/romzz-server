import { Router } from 'express';
import { SliderControllers } from './slider.controller';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';

const router = Router();

router
  .route('/')

  .get(SliderControllers.getSliders)
  .post(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    SliderControllers.createSlider,
  );

router
  .route('/:id')

  .patch(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    SliderControllers.updateSliderById,
  )
  .delete(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    SliderControllers.deleteSliderById,
  );

export const SliderRoutes = router;
