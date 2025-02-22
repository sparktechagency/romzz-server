import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { PricingPlanController } from './pricingPlan.controller';

const router = Router();

router
  .route('/')

  // GET request to fetch all "Pricing Plan" entries
  .get(PricingPlanController.createPackage)

  // POST request to create a new "Pricing Plan" entry
  .post(
    validateAuth(USER_ROLE['SUPER-ADMIN']),
    PricingPlanController.createPackage,
  );

router
  .route('/:id')

  .patch(
    validateAuth(USER_ROLE['SUPER-ADMIN']),
    PricingPlanController.updatePackage,
  )

  .delete(
    validateAuth(USER_ROLE['SUPER-ADMIN']),
    PricingPlanController.deletePackage,
  );

export const PricingPlanRoutes = router;
