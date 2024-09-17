/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IProperty } from './property.interface';
import { Property } from './property.model';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import {
  MAX_PROPERTY_IMAGES,
  propertyFieldsToExclude,
  PropertySearchableFields,
} from './property.constant';
import { Favourite } from '../Favourite/favourite.model';
import { unlinkFile, unlinkFiles } from '../../helpers/fileHandler';
import { NotificationServices } from '../Notification/notification.service';
import getPathAfterUploads from '../../helpers/getPathAfterUploads';
import getLatAndLngFromAddress from '../../helpers/getLatAndLngFromAddress';
import { UserServices } from '../User/user.service';
import { User } from '../User/user.model';
import { Subscription } from '../Subscription/subscription.model';
import { endOfMonth, startOfMonth } from 'date-fns';
import { IPricingPlan } from '../PricingPlan/pricingPlan.interface';

const createPropertyToDB = async (
  user: JwtPayload,
  payload: IProperty,
  files: any,
) => {
  // Calculate the user's profile completion progress
  const { progress } =
    await UserServices.calculateUserProfileProgressFromDB(user);

  // Check if the user's profile is fully completed (100%)
  if (progress < 100) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Complete your profile before booking. Current progress: ${progress}%.`,
    );
  }

  // Retrieve the user's account info from the database
  const existingUser = await User.findById(user?.userId);

  // Retrieve the user's active subscription
  const subscription = await Subscription.findOne({
    userId: user?.userId,
    status: 'active',
  }).populate<{ packageId: IPricingPlan }>('packageId');

  // If no subscription exists, prevent the user from listing properties
  if (!subscription) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'No subscription found. Please subscribe to list properties.',
    );
  }

  // Check if the user has completed their Stripe account setup
  if (!existingUser?.stripeAccountInfo?.accountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Complete your Stripe account setup to list a property.',
    );
  }

  // Determine the start and end of the subscription period
  const subscriptionStartDate = subscription.createdAt;
  const startOfSubscriptionPeriod = startOfMonth(subscriptionStartDate);
  const endOfSubscriptionPeriod = endOfMonth(subscriptionStartDate);

  // Count the properties the user has listed this month
  const userPropertyCount = await Property.countDocuments({
    createdBy: user?.userId,
    createdAt: {
      $gte: startOfSubscriptionPeriod,
      $lte: endOfSubscriptionPeriod,
    },
  });

  // Retrieve the property listing limit from the user's subscription plan
  const monthlyLimit = subscription?.packageId?.maxProperties;

  // Check if the user has exceeded their monthly listing limit (unless it's unlimited)
  if (monthlyLimit !== 'infinity' && userPropertyCount >= monthlyLimit) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Monthly limit of ${monthlyLimit} properties reached.`,
    );
  }

  // Assign the user ID who is creating the property
  payload.createdBy = user?.userId;

  // Set default values for new properties
  payload.status = 'pending';
  payload.isApproved = false;
  payload.isBooked = false;
  payload.isHighlighted = false;

  // Convert address to latitude and longitude
  if (payload?.location?.address) {
    const { address, latitude, longitude } = await getLatAndLngFromAddress(
      payload?.location?.address,
    );

    payload.location.address = address;
    payload.location.latitude = latitude;
    payload.location.longitude = longitude;
  }

  // Extract and map the image file paths
  if (files && files?.ownershipImages) {
    payload.ownershipImages = files?.ownershipImages?.map((file: any) =>
      getPathAfterUploads(file?.path),
    );
  }

  // Extract and map the image file paths
  if (files && files?.propertyImages) {
    payload.propertyImages = files?.propertyImages?.map((file: any) =>
      getPathAfterUploads(file?.path),
    );
  }

  // Extract and set the video file path
  if (files && files?.propertyVideo) {
    payload.propertyVideo = getPathAfterUploads(
      files?.propertyVideo?.[0]?.path,
    );
  }

  // Set the price to be 20% more than the actual price
  if (payload.price) {
    payload.price = payload.price * 1.2; // Increase the price by 20%
  }

  // Create the property in the database
  const result = await Property.create(payload);

  // Notify admins and superadmins of new property creation
  await NotificationServices.notifyPropertyCreationFromDB(
    result?._id?.toString(),
  );

  return result;
};

const getAllPropertiesFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const propertiesQuery = new QueryBuilder(
    Property.find()
      .populate({
        path: 'createdBy',
        select: 'fullName email avatar phoneNumber',
      })
      .select('status'),
    query,
  )
    .search(['address']) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await propertiesQuery.countTotal();

  // Execute the query to retrieve the reviews
  const data = await propertiesQuery.modelQuery;

  return { meta, data };
};

const getApprovedPropertiesFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const propertiesQuery = new QueryBuilder(
    Property.find({
      isApproved: true,
      isBooked: false,
      isHighlighted: false,
    })
      .populate({
        path: 'createdBy',
        select: 'avatar rating',
      })
      .select('propertyImages price priceType title category location'),
    query,
  )
    .search(PropertySearchableFields) // Search within searchable fields
    .filter() // Apply general filters
    .sort() // Apply sorting
    .paginate(); // Apply pagination

  // Get the total count of matching documents and total pages for pagination
  const meta = await propertiesQuery.countTotal();

  // Execute the query to retrieve the reviews
  const data = await propertiesQuery.modelQuery;

  return { meta, data };
};

const getHighlightedPropertiesFromDB = async () => {
  const result = Property.find({
    isApproved: true,
    isBooked: false,
    isHighlighted: true,
  })
    .populate({
      path: 'createdBy',
      select: 'avatar',
    })
    .select('propertyImages price priceType title category location');

  return result;
};

const getPropertyByIdFromDB = async (propertyId: string) => {
  // Find the Review by ID and populate the userId field
  const result = await Property.findById(propertyId)
    .select('-status')
    .populate({
      path: 'createdBy',
      select: 'fullName avatar',
    })
    .populate({
      path: 'facilities',
      select: 'name icon',
    });

  // Handle the case where the property is not found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  return result;
};

const getPropertyByUserIdFromDB = async (userId: string) => {
  const result = await Property.find({ createdBy: userId })
    .populate({
      path: 'createdBy',
      select: 'avatar',
    })
    .select(
      'propertyImages price priceType title category location status createdAt',
    );
  return result;
};

const updatePropertyByIdToDB = async (
  user: JwtPayload,
  propertyId: string,
  files: any,
  payload: Partial<IProperty> & {
    propertyImagesToDelete?: string[];
    requestApproval?: boolean;
  },
) => {
  // Find the existing property
  const existingProperty = await Property.findById(propertyId);

  // Handle case where property is not found
  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  // Ensure the user trying to update the property is the creator
  if (existingProperty?.createdBy?.toString() !== user?.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this property!',
    );
  }

  // Initialize updated lists
  let updatedPropertyImages = existingProperty?.propertyImages || [];

  // Handle deletion of property images
  if (payload?.propertyImagesToDelete) {
    updatedPropertyImages = updatedPropertyImages?.filter(
      (image: string) => !payload?.propertyImagesToDelete?.includes(image),
    );

    // Delete specified images from storage
    unlinkFiles(payload?.propertyImagesToDelete);
  }

  // Update proof of ownership if new files are provided
  if (files && files?.propertyImages) {
    const newImages = files?.propertyImages?.map((file: any) =>
      getPathAfterUploads(file?.path),
    );

    // Combine existing and new images
    updatedPropertyImages = [...updatedPropertyImages, ...newImages];

    // Ensure the total number of images does not exceed the limit
    if (updatedPropertyImages?.length > MAX_PROPERTY_IMAGES) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `You can only have up to ${MAX_PROPERTY_IMAGES} property images!`,
      );
    }

    // Save the updated property images to the payload
    payload.propertyImages = updatedPropertyImages;
  }

  // If a new image is uploaded, update the image path in the payload
  if (files && files?.propertyVideo) {
    const newPropertyVideoPath = getPathAfterUploads(
      files?.propertyVideo[0]?.path,
    );

    // If a new image file is uploaded, update the image path in the payload
    if (existingProperty?.propertyVideo !== newPropertyVideoPath) {
      payload.propertyVideo = newPropertyVideoPath; // Update the payload with the new image path
      unlinkFile(existingProperty?.propertyVideo); // Remove the old image file
    }
  }

  // Exclude specific fields from being updated
  propertyFieldsToExclude?.forEach((field) => delete payload[field]);

  // Set the status to 'pending' if requestApproval is true
  if (payload?.requestApproval) {
    payload.status = 'pending';
  }

  // Save new data to the database
  const result = await Property.findByIdAndUpdate(propertyId, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const updatePropertyStatusToApproveToDB = async (propertyId: string) => {
  // Update the Property status to 'approve'
  const result = await Property.findByIdAndUpdate(propertyId, {
    status: 'approved',
    isApproved: true,
  });

  // Handle case where no Property is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  // Notify the user and all users about property approval
  await NotificationServices.notifyPropertyApprovalFromDB(
    result?._id?.toString(),
    result?.createdBy?.toString(),
  );
};

const updatePropertyStatusToRejectToDB = async (propertyId: string) => {
  // Update the Property status to 'reject'
  const result = await Property.findByIdAndUpdate(propertyId, {
    status: 'rejected',
    isApproved: false,
  });

  // Handle case where no Property is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  // Notify the user about property rejection
  await NotificationServices.notifyPropertyRejectionFromDB(
    result?.createdBy?.toString(),
  );
};

const toggleHighlightPropertyToDB = async (
  user: JwtPayload,
  propertyId: string,
) => {
  // Find the existing property
  const existingProperty = await Property.findById(propertyId);

  // Check if the property exists
  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  // Ensure the user trying to update the property is the creator
  if (existingProperty?.createdBy?.toString() !== user?.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this property!',
    );
  }

  // Find the user's subscription and check the limit for highlighted properties
  const subscription = await Subscription.findOne({
    userId: user?.userId,
    status: 'active',
  }).populate<{
    packageId: IPricingPlan;
  }>('packageId');

  // If no subscription exists, prevent the user from listing properties
  if (!subscription) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'No subscription found. Please subscribe to list properties.',
    );
  }

  const maxHighlightedProperties =
    subscription?.packageId?.maxHighlightedProperties;

  // Handle case where no highlighting is allowed (maxHighlightedProperties is 0 or undefined)
  if (!maxHighlightedProperties || maxHighlightedProperties <= 0) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your subscription plan does not allow highlighting property!',
    );
  }

  // Determine the start and end of the subscription period
  const subscriptionStartDate = subscription.createdAt;
  const startOfSubscriptionPeriod = startOfMonth(subscriptionStartDate);
  const endOfSubscriptionPeriod = endOfMonth(subscriptionStartDate);

  // Count the number of highlighted properties the user currently has
  const highlightedCount = await Property.countDocuments({
    createdBy: user?.userId,
    isHighlighted: true,
    updatedAt: {
      $gte: startOfSubscriptionPeriod,
      $lte: endOfSubscriptionPeriod,
    },
  });

  // If the property is already highlighted, we are toggling it off, no need to check the limit
  if (!existingProperty.isHighlighted) {
    // If the user has reached their highlight limit, block the toggle
    if (highlightedCount >= maxHighlightedProperties) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        `Highlight limit of ${maxHighlightedProperties} properties reached.`,
      );
    }
  }

  // Toggle the 'isHighlighted' field
  existingProperty.isHighlighted = !existingProperty.isHighlighted;

  // Save the updated property
  const result = await existingProperty.save();
  return result;
};

const toggleFavouritePropertyToDB = async (
  user: JwtPayload,
  propertyId: string,
) => {
  // Check if the property exists
  const existingProperty =
    await Property.findById(propertyId).select('isApproved');

  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  if (!existingProperty?.isApproved) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Property with ID: ${propertyId} is not approved and cannot be favorited!`,
    );
  }

  // Check if the user has already favourited the property
  const existingFavorite = await Favourite.findOne({
    userId: user?.userId,
    propertyId,
  });

  if (existingFavorite) {
    // If already favourited, remove it
    await Favourite.deleteOne({ userId: user?.userId, propertyId });
    return { isFavourited: false };
  } else {
    // If not favourited, add to favorites
    await Favourite.create({ userId: user?.userId, propertyId });
    return { isFavourited: true };
  }
};

export const PropertyServices = {
  createPropertyToDB,
  getAllPropertiesFromDB,
  getApprovedPropertiesFromDB,
  getHighlightedPropertiesFromDB,
  getPropertyByUserIdFromDB,
  getPropertyByIdFromDB,
  updatePropertyByIdToDB,
  updatePropertyStatusToApproveToDB,
  updatePropertyStatusToRejectToDB,
  toggleHighlightPropertyToDB,
  toggleFavouritePropertyToDB,
};
