import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { TestimonialRoutes } from '../modules/Testimonial/testimonial.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { PropertyRoutes } from '../modules/Property/property.route';
import { BlogRoutes } from '../modules/Blog/blog.route';
import { SliderRoutes } from '../modules/Slider/slider.route';
import { StoryRoutes } from '../modules/Our Story/story.route';

const router = Router();

const routes = [
  { path: '/users', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/properties', route: PropertyRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/testimonials', route: TestimonialRoutes },

  // Dashboard settings
  { path: '/sliders', route: SliderRoutes },
  { path: '/stories', route: StoryRoutes },
  { path: '/blogs', route: BlogRoutes },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
