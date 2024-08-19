import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { TestimonialRoutes } from '../modules/Testimonial/testimonial.route';
import { ReviewRoutes } from '../modules/Review/review.route';

const router = Router();

const routes = [
  { path: '/users', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/testimonials', route: TestimonialRoutes },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
