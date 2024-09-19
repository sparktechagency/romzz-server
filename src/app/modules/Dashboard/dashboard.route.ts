import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { DashboardControllers } from './dashboard.controller';

const router = Router();

router.get(
  '/metrics',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  DashboardControllers.getDashboardMetrics,
);

router.get(
  '/users-count/:year',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  DashboardControllers.getUserCountsByYear,
);

router.get(
  '/revenue-count/:year',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  DashboardControllers.getRevenueCountsByYear,
);

export const DashboardRoutes = router;
