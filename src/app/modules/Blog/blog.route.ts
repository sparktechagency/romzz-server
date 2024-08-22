import { Router } from 'express';
import { BlogControllers } from './blog.controller';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/validateAuth';

const router = Router();

router.get('/', BlogControllers.getBlogs);
router.get('/:id', BlogControllers.getBlogById);

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  BlogControllers.createBlog,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  BlogControllers.updateBlogById,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  BlogControllers.deleteBlogById,
);

export const BlogRoutes = router;
