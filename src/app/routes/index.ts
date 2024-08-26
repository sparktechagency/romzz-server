import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { PropertyRoutes } from '../modules/Property/property.route';
import { BlogRoutes } from '../modules/Blog/blog.route';
import { SliderRoutes } from '../modules/Slider/slider.route';
import { StoryRoutes } from '../modules/OurStory/ourStory.route';
import { FaqRoutes } from '../modules/FAQ/faq.route';
import { TermsRoutes } from '../modules/TermsAndConditions/terms.route';
import { FeedbackRoutes } from '../modules/Feedback/feedback.route';
import { ContactRoutes } from '../modules/Contact/contact.route';
import { MediaRoutes } from '../modules/SocialMedia/socialMedia.route';
import { FacilityRoutes } from '../modules/Facility/facility.route';

const router = Router();

const routes = [
  { path: '/users', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/properties', route: PropertyRoutes },

  // Dashboard
  { path: '/facilities', route: FacilityRoutes },

  // Settings
  { path: '/sliders', route: SliderRoutes },
  { path: '/our-story', route: StoryRoutes },
  { path: '/terms-and-conditions', route: TermsRoutes },
  { path: '/faqs', route: FaqRoutes },
  { path: '/blogs', route: BlogRoutes },
  { path: '/feedbacks', route: FeedbackRoutes },
  { path: '/contacts', route: ContactRoutes },
  { path: '/medias', route: MediaRoutes },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
