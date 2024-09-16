import { NextFunction, Request, Response, Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { PropertyControllers } from './property.controller';
import { upload } from '../../helpers/uploadConfig';
import validateRequest from '../../middlewares/validateRequest';
import { propertyValidationSchema } from './property.validation';

const router = Router();

router
  .route('/')

  .get(
    validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
    PropertyControllers.getAllProperties,
  )

  .post(
    validateAuth(USER_ROLE.USER),
    upload.fields([
      { name: 'ownershipImages', maxCount: 2 }, // Array of images, max 2 files
      { name: 'propertyImages', maxCount: 11 }, // Array of images, max 11 files
      { name: 'propertyVideo', maxCount: 1 }, // Single video file
    ]),
    (req: Request, res: Response, next: NextFunction) => {
      req.body = JSON.parse(req?.body?.data);
      next();
    },
    validateRequest(propertyValidationSchema),
    PropertyControllers.createProperty,
  );

router.get('/approved-properties', PropertyControllers.getApprovedProperties);

router.get(
  '/highlighted-properties',
  PropertyControllers.getHighlightedProperties,
);

router.get('/user-properties/:userId', PropertyControllers.getPropertyByUserId);

router
  .route('/:id')

  .get(PropertyControllers.getPropertyById)

  .patch(
    validateAuth(USER_ROLE.USER),
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

router.patch(
  '/approve/:id',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  PropertyControllers.updatePropertyStatusToApprove,
);

router.patch(
  '/reject/:id',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  PropertyControllers.updatePropertyStatusToReject,
);

router.patch(
  '/toggle-highlight/:id',
  validateAuth(USER_ROLE.USER),
  PropertyControllers.toggleHighlightProperty,
);

router.patch(
  '/toggle-favourite/:id',
  validateAuth(USER_ROLE.USER),
  PropertyControllers.toggleFavouriteProperty,
);

export const PropertyRoutes = router;
