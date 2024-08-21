import { NextFunction, Request, Response, Router } from 'express';
import { upload } from '../../helpers/multer';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { PropertyControllers } from './property.controller';

const router = Router();

router.post(
  '/',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.fields([
    { name: 'proofOfOwnership', maxCount: 2 }, // Array of images, max 2 files
    { name: 'propertyImages', maxCount: 11 }, // Array of images, max 11 files
    { name: 'propertyVideo', maxCount: 1 }, // Single video file
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req?.body?.data);
    next();
  },
  PropertyControllers.createProperty,
);

router.get('/', PropertyControllers.getAllProperties);
router.get('/approved-properties', PropertyControllers.getApprovedProperties);
router.get('/:id', PropertyControllers.getPropertyById);

router.patch(
  '/:id',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.fields([
    { name: 'proofOfOwnership', maxCount: 2 }, // Array of images, max 2 files
    { name: 'propertyImages', maxCount: 11 }, // Array of images, max 11 files
    { name: 'propertyVideo', maxCount: 1 }, // Single video file
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req?.body?.data);
    next();
  },
  PropertyControllers.createProperty,
);

export const PropertyRoutes = router;
