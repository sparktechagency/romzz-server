import { Router } from 'express';
import { BlogControllers } from './blog.controller';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/validateAuth';

const router = Router();

router
  .route('/')

  .get(BlogControllers.getBlogs)
  .post(
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    BlogControllers.createBlog,
  );

router
  .route('/:id')

  .get(BlogControllers.getBlogById)
  .patch(
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    BlogControllers.updateBlogById,
  )
  .delete(
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    BlogControllers.deleteBlogById,
  );

export const BlogRoutes = router;
