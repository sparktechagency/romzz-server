import { Router } from 'express';
import { TestimonialControllers } from './testimonial.controller';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/validateAuth';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  TestimonialControllers.createTestimonial,
);

router.get('/', TestimonialControllers.getTestimonials);
router.get('/:id', TestimonialControllers.getTestimonialById);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  TestimonialControllers.updateTestimonialStatusById,
);

export const TestimonialRoutes = router;
