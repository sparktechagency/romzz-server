import { NextFunction, Request, Response, Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { PropertyControllers } from './property.controller';
import { upload } from '../../helpers/multer';

const router = Router();

router.post(
  '/',
  validateAuth(USER_ROLE.user),
  upload.fields([
    { name: 'ownershipImages', maxCount: 2 }, // Array of images, max 2 files
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
  validateAuth(USER_ROLE.user),
  upload.fields([
    { name: 'propertyImages', maxCount: 11 }, // Array of images, max 11 files
    { name: 'propertyVideo', maxCount: 1 }, // Single video file
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req?.body?.data);
    next();
  },
  PropertyControllers.updatePropertyById,
);

export const PropertyRoutes = router;
