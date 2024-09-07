import { Router } from 'express';
import { BlogControllers } from './blog.controller';
import { USER_ROLE } from '../User/user.constant';
import validateAuth from '../../middlewares/validateAuth';
import { upload } from '../../helpers/uploadConfig';

const router = Router();

router
  .route('/')

  .get(BlogControllers.getBlogs)
  .post(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    upload.single('image'),
    BlogControllers.createBlog,
  );

router
  .route('/:id')

  .get(BlogControllers.getBlogById)
  .patch(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    upload.single('image'),
    BlogControllers.updateBlogById,
  )
  .delete(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    BlogControllers.deleteBlogById,
  );

export const BlogRoutes = router;
