import { JwtPayload } from 'jsonwebtoken';
import { User } from '../User/user.model'; // Assuming there's a user model
import { Notification } from './notification.model';
import QueryBuilder from '../../builder/QueryBuilder';

const sendNotificationToAdminsFromDB = async (message: string, url: string) => {
  const adminsAndSuperAdmins = await User.find({
    role: { $in: ['admin', 'superAdmin'] },
    status: 'active',
  });

  const notifications = adminsAndSuperAdmins.map((user) => ({
    userId: user?._id,
    message,
    url,
    isSeen: false,
    isRead: false,
  }));
  await Notification.insertMany(notifications);
};

const sendNotificationToUsersFromDB = async (
  message: string,
  url: string,
  excludedUserId?: string,
) => {
  const allUsers = await User.find({
    role: 'USER',
    status: 'active',
    _id: { $ne: excludedUserId },
  });

  const notifications = allUsers.map((user) => ({
    userId: user?._id,
    message,
    url,
    isSeen: false,
    isRead: false,
  }));
  await Notification.insertMany(notifications);
};

const sendNotificationToUserFromDB = async (
  userId: string,
  message: string,
  url: string,
) => {
  await Notification.create({
    userId,
    message,
    url,
    isSeen: false,
    isRead: false,
  });
};

const notifyPropertyCreationFromDB = async (propertyId: string) => {
  const message = 'A new property has been listed.';
  const url = `/properties/${propertyId}`; // URL to the property details page

  // Notify all admins and super admins
  await sendNotificationToAdminsFromDB(message, url);
};

const notifyPropertyApprovalFromDB = async (
  propertyId: string,
  userId: string,
) => {
  const approvalMessage = 'Your property has been approved.';
  const newPropertyMessage = 'A new property has been approved and listed.';
  const url = `/properties/${propertyId}`;

  // Notify the user who listed the property
  await sendNotificationToUserFromDB(userId, approvalMessage, url);

  // Notify all users
  await sendNotificationToUsersFromDB(newPropertyMessage, url, userId);
};

const notifyPropertyRejectionFromDB = async (
  userId: string,
  propertyId: string,
) => {
  const message = 'Your property has been rejected.';
  const url = `/properties/${propertyId}`;

  // Notify the user who listed the property
  await sendNotificationToUserFromDB(userId, message, url);
};

const getAllNotificationsByIdFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  // Build the query using QueryBuilder with the given query parameters
  const notificationsQuery = new QueryBuilder(
    Notification.find({ userId: user?.userId }),
    query,
  )
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await notificationsQuery.countTotal();
  // Execute the query to retrieve the reviews
  const result = await notificationsQuery.modelQuery;

  return { meta, result };
};

const markAllNotificationsAsSeenByIdFromDB = async (user: JwtPayload) => {
  await Notification.updateMany(
    { userId: user?.userId, isSeen: false }, // Criteria for selecting notifications
    { isSeen: true }, // Update operation to mark as read
  );
};

const markAllNotificationsAsReadByIdFromDB = async (user: JwtPayload) => {
  await Notification.updateMany(
    { userId: user?.userId, isRead: false }, // Criteria for selecting notifications
    { isRead: true }, // Update operation to mark as read
  );
};

export const NotificationServices = {
  sendNotificationToAdminsFromDB,
  sendNotificationToUsersFromDB,
  notifyPropertyCreationFromDB,
  notifyPropertyApprovalFromDB,
  notifyPropertyRejectionFromDB,
  getAllNotificationsByIdFromDB,
  markAllNotificationsAsSeenByIdFromDB,
  markAllNotificationsAsReadByIdFromDB,
};
