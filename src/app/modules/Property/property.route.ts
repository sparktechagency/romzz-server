import { NextFunction, Request, Response, Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { PropertyControllers } from './property.controller';
import { upload } from '../../helpers/uploadConfig';

const router = Router();

// Route to get all properties and create a new property
router
  .route('/')

  // Route to get all properties
  .get(
    validateAuth(USER_ROLE.admin, USER_ROLE.superAdmin),
    PropertyControllers.getAllProperties,
  )

  // Route to create a new property
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

// Route to get only approved properties
router.get('/approved-properties', PropertyControllers.getApprovedProperties);

// Route to get properties created by the user
router.get(
  '/user-properties',
  validateAuth(USER_ROLE.user),
  PropertyControllers.getPropertyByUserId,
);

router
  .route('/:id')

  // Route to get a property by ID
  .get(PropertyControllers.getPropertyById)

  // Route to update a property by ID
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

// Route to toggle favorite status for a property
router.patch(
  '/favourite/:id',
  validateAuth(USER_ROLE.user),
  PropertyControllers.togglePropertyFavouriteStatus,
);

export const PropertyRoutes = router;
