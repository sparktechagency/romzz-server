import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { PricingPlanControllers } from './pricingPlan.controller';

const router = Router();

router
  .route('/')

  // GET request to fetch all "Pricing Plan" entries
  .get(PricingPlanControllers.getPricingPlans)

  // POST request to create a new "Pricing Plan" entry
  .post(
    validateAuth(USER_ROLE['SUPER-ADMIN']),
    PricingPlanControllers.createPricingPlan,
  );

// PATCH request to update an existing "Pricing Plan" entry by its ID
router.patch(
  '/:id',
  validateAuth(USER_ROLE['SUPER-ADMIN']),
  PricingPlanControllers.updatePricingPlanById,
);

export const PricingPlanRoutes = router;
