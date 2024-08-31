import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { FacilityControllers } from './facility.controller';
import { upload } from '../../helpers/uploadConfig';

const router = Router();

router
  .route('/')

  .get(FacilityControllers.getFacilities)
  .post(
    validateAuth(USER_ROLE.superAdmin),
    upload.single('icon'),
    FacilityControllers.createFacility,
  );

router
  .route('/:id')

  .patch(
    validateAuth(USER_ROLE.superAdmin),
    upload.single('icon'),
    FacilityControllers.updateFacilityById,
  )
  .delete(
    validateAuth(USER_ROLE.superAdmin),
    FacilityControllers.deleteFacilityById,
  );

export const FacilityRoutes = router;
