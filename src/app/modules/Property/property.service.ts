/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IProperty } from './property.interface';
import { Property } from './property.model';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import {
  MAX_PROPERTY_IMAGES,
  PropertySearchableFields,
} from './property.constant';
import { Favourite } from '../Favourite/favourite.model';
import { unlinkFile, unlinkFiles } from '../../helpers/fileHandler';
import { NotificationServices } from '../Notification/notification.service';
import getPathAfterUploads from '../../helpers/getPathAfterUploads';
import getLatAndLngFromAddress from '../../helpers/getLatAndLngFromAddress';
import { UserServices } from '../User/user.service';
import { Subscription } from '../Subscription/subscription.model';
import { endOfMonth, startOfMonth } from 'date-fns';
import { IPricingPlan } from '../PricingPlan/pricingPlan.interface';
import { Booking } from '../Booking/booking.model';
import mongoose from 'mongoose';
import { Facility } from '../Facility/facility.model';
import { IUser } from './../User/user.interface';

const createPropertyToDB = async (
  user: JwtPayload,
  payload: IProperty,
  files: any,
) => {
  // Validate facility IDs
  if (payload?.facilities) {
    const validFacilities = await Facility.find({
      _id: { $in: payload?.facilities },
    });

    if (validFacilities?.length !== payload?.facilities?.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'One or more facility IDs are invalid.',
      );
    }
  }

  // Calculate the user's profile completion progress
  const { progress } = await UserServices.getUserProfileProgressFromDB(user);

  // Check if the user's profile is fully completed (100%)
  if (progress < 100) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Complete your profile before booking. Current progress: ${progress}%.`,
    );
  }

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

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Assign the user ID who is creating the property
    payload.createdBy = user?.userId;
    payload.subscriptionId = subscription._id;

    // Set default values for new properties
    payload.status = 'pending';
    payload.isApproved = false;
    payload.isBooked = false;
    payload.isHighlighted = false;
    payload.location = payload.location || { type: 'Point', coordinates: [] };

    // Convert address to latitude and longitude
    if (payload?.address) {
      const { address, latitude, longitude } = await getLatAndLngFromAddress(
        payload?.address,
      );

      payload.address = address;
      payload.location.coordinates = [longitude, latitude];
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
    const result = await Property.create([payload], { session });

    // Notify admins and superadmins of new property creation
    await NotificationServices.notifyPropertyCreationFromDB(
      result[0]?._id?.toString(),
      session,
    );

    // Commit the transaction
    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    await session.endSession();

    // Re-throw the error to be handled by the caller
    throw error;
  }
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
    .search(PropertySearchableFields) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await propertiesQuery.countTotal();

  // Execute the query to retrieve the reviews
  const data = await propertiesQuery.modelQuery;

  return { meta, data };
};

const getApprovedPropertiesFromDB = async (query: any) => {

  const {search, rating, page, limit, sort, ...filerData } = query;
  const anyConditions = [];


  anyConditions.push({
    isApproved: true, // Must be approved
    isBooked: false, // Must not be booked
    isHighlighted: false,
  });

  //artist search here
  if (search) {
    anyConditions.push({
        $or: ["title", "address"].map((field) => ({
            [field]: {
                $regex: search,
                $options: "i"
            }
        }))
    });
  }


  // Set the sorting condition
  let sortCondition = {}; // Default: no sorting
  if (sort === "price") {
    sortCondition = { price: 1 }; // Ascending order (low to high)
  } else if (sort === "-price") {
    sortCondition = { price: -1 }; // Descending order (high to low)
  }

  // property filter here
  if(Object.keys(filerData).length){
    anyConditions.push({
        $and: Object.entries(filerData).map(([field, value])=>({
            [field]: value
        }))
    })
  }

  //artist filter with price range
  if (rating) {
    anyConditions.push({
        "createdBy.rating": {
            $gte: rating,
            $lt: rating + 1
        },
    });
  }

  const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};

  const pages = parseInt(page) || 1;
  const size = parseInt(limit) || 10;
  const skip = (pages - 1) * size;

  const services = await Property.find(whereConditions)
    .populate({
      path: "createdBy",
      select: "avatar fullName"
    })
    .sort(sortCondition) //sorting here
    .skip(skip)
    .limit(size);

  const count = await Property.countDocuments(whereConditions);

  const data:any =  {
    data: services,
    meta: {
      page: pages,
      total: count
    }
  }
  return data;

};

const getHighlightedPropertiesFromDB = async () => {
  const result = await Property.aggregate([
    {
      $lookup: {
        from: 'users', // The name of the User collection
        localField: 'createdBy', // Field in Property collection
        foreignField: '_id', // Field in User collection
        as: 'createdBy', // Name for the populated field
      },
    },
    {
      $unwind: {
        path: '$createdBy',
        preserveNullAndEmptyArrays: true, // Optional: Keep properties without a createdBy reference
      },
    },
    {
      $match: {
        isApproved: true,
        isBooked: false,
        isHighlighted: true,
        'createdBy.isSubscribed': true, // Creator must be subscribed
        'createdBy.hasAccess': true, // Creator must have access
      },
    },
    {
      $project: {
        propertyImages: 1,
        price: 1,
        priceType: 1,
        title: 1,
        category: 1,
        address: 1,
        createdBy: {
          avatar: 1,
        },
      },
    },
  ]);

  return result;
};

const getPropertyByIdFromDB = async (propertyId: string) => {
  // Find the Review by ID and populate the userId field
  const result = await Property.findById(propertyId)
    .select('-status -isHighlighted')
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

const getPropertyByUserIdFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  // Define the base query object
  let findQuery: Record<string, unknown> = { createdBy: userId };

  // If payload.type is not 'all', include isApproved and isBooked conditions
  if (query?.type !== 'all') {
    findQuery = { ...findQuery, isApproved: true, isBooked: false };
  }

  // Build the query using QueryBuilder with the given query parameters
  const propertiesQuery = new QueryBuilder(
    Property.find(findQuery)
      .populate({
        path: 'createdBy',
        select: 'avatar',
      }),
    query,
  ).paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await propertiesQuery.countTotal();

  // Execute the query to retrieve the properties
  const properties = await propertiesQuery.modelQuery;

  // Extract property IDs
  const propertyIds = properties?.map((property) => property?._id);

  // Find bookings for properties
  const bookings = await Booking.find({
    propertyId: { $in: propertyIds },
  }).populate<{ userId: IUser }>({
    path: 'userId',
    select: 'avatar fullName',
  });

  // Map bookings to their respective properties
  const propertiesWithBookings = properties.map((property: any) => {
    // Find the booking for the current property
    const booking = bookings.find(
      (booking) => booking.propertyId.toString() === property._id.toString(),
    );

    return {
      ...property?.toObject(), // Convert property to plain object
      bookedInfo: booking
        ? {
            _id: booking.userId._id,
            fullName: booking.userId.fullName,
            avatar: booking.userId.avatar,
          }
        : null, // Set to null if there is no booking
    };
  });

  return { meta, data: propertiesWithBookings };
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

  // Validate facility IDs
  if (payload?.facilities) {
    const validFacilities = await Facility.find({
      _id: { $in: payload?.facilities },
    });

    if (validFacilities?.length !== payload?.facilities?.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'One or more facility IDs are invalid.',
      );
    }
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
  // propertyFieldsToExclude?.forEach((field) => delete payload[field]);

  // Set the status to 'pending' if requestApproval is true
  if (payload?.requestApproval) {
    payload.status = 'pending';
  }
  

  // Save new data to the database
  const result = await Property.findByIdAndUpdate(
    {_id: propertyId}, 
    payload, 
    { new: true }
  );
  return result;
};

const updatePropertyStatusToApproveToDB = async (propertyId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Update the Property status to 'approve'
    const result = await Property.findByIdAndUpdate(
      propertyId,
      {
        status: 'approved',
        isApproved: true,
      },
      { new: true, session },
    );

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
      session,
    );

    // Commit the transaction
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    await session.endSession();

    // Re-throw the error to be handled by the caller
    throw error;
  }
};

const updatePropertyStatusToRejectToDB = async (propertyId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Update the Property status to 'reject'
    const result = await Property.findByIdAndUpdate(
      propertyId,
      {
        status: 'rejected',
        isApproved: false,
      },
      { new: true, session },
    );

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
      session,
    );

    // Commit the transaction
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    await session.endSession();

    // Re-throw the error to be handled by the caller
    throw error;
  }
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
