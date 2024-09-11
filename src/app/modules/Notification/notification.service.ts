import { JwtPayload } from 'jsonwebtoken';
import { User } from '../User/user.model'; // Assuming there's a user model
import { Notification } from './notification.model';
import QueryBuilder from '../../builder/QueryBuilder';

const sendNotificationToAdminsFromDB = async (url: string, message: string) => {
  const adminsAndSuperAdmins = await User.find({
    role: { $in: ['ADMIN', 'SUPER-ADMIN'] },
    status: 'active',
  });

  const notifications = adminsAndSuperAdmins.map((user) => ({
    url,
    message,
    userId: user?._id,
    isSeen: false,
    isRead: false,
  }));
  await Notification.insertMany(notifications);
};

const sendNotificationToUsersFromDB = async (
  url: string,
  message: string,
  excludedUserId?: string,
) => {
  const allUsers = await User.find({
    role: 'USER',
    status: 'active',
    _id: { $ne: excludedUserId },
  });

  const notifications = allUsers.map((user) => ({
    url,
    message,
    userId: user?._id,
    isSeen: false,
    isRead: false,
  }));
  await Notification.insertMany(notifications);
};

const sendNotificationToUserFromDB = async (
  url: string | null,
  message: string,
  userId: string,
) => {
  await Notification.create({
    url,
    message,
    userId,
    isSeen: false,
    isRead: false,
  });
};

const notifyPropertyCreationFromDB = async (propertyId: string) => {
  const message = 'A new property has been listed.';
  const url = `/properties/${propertyId}`; // URL to the property details page

  // Notify all admins and super admins
  await sendNotificationToAdminsFromDB(url, message);
};

const notifyPropertyApprovalFromDB = async (
  userId: string,
  propertyId: string,
) => {
  const approvalMessage = 'Your property has been approved.';
  const newPropertyMessage = 'A new property has been approved and listed.';
  const url = `/properties/${propertyId}`;

  // Notify the user who listed the property
  await sendNotificationToUserFromDB(url, approvalMessage, userId);

  // Notify all users
  await sendNotificationToUsersFromDB(url, newPropertyMessage, userId);
};

const notifyPropertyRejectionFromDB = async (userId: string) => {
  const url = null;
  const message = 'Your property has been rejected.';

  // Notify the user who listed the property
  await sendNotificationToUserFromDB(url, message, userId);
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
