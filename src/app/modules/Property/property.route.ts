import { NextFunction, Request, Response, Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { PropertyControllers } from './property.controller';
import { upload } from '../../helpers/uploadConfig';

const router = Router();

router
  .route('/')

  .get(PropertyControllers.getAllProperties)
  .post(
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

router.get('/approved-properties', PropertyControllers.getApprovedProperties);
router.get(
  '/user-properties',
  validateAuth(USER_ROLE.user),
  PropertyControllers.getPropertyByUserId,
);

router
  .route('/:id')

  .get(PropertyControllers.getPropertyById)
  .patch(
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

// Route to update property status to "approve"
router.patch(
  '/approve/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  PropertyControllers.updatePropertyStatusToApprove,
);

// Route to update property status to "reject"
router.patch(
  '/reject/:id',
  validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
  PropertyControllers.updatePropertyStatusToReject,
);
export const PropertyRoutes = router;
