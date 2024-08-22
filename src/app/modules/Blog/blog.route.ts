import { Router } from 'express';
import { BlogControllers } from './blog.controller';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/validateAuth';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  BlogControllers.createBlog,
);

router.get('/', BlogControllers.getBlogs);
router.get('/:id', BlogControllers.getBlogById);

export const BlogRoutes = router;
