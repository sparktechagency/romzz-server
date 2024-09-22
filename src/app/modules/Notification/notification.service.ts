import { JwtPayload } from 'jsonwebtoken';
import { User } from '../User/user.model'; // Assuming there's a user model
import { Notification } from './notification.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { emitSocketEvent } from '../../socket';
import { ChatEvents } from '../../constants/chat.constant';
import { ClientSession } from 'mongoose';

const sendNotificationToAdminsFromDB = async (
  url: string,
  message: string,
  session: ClientSession,
) => {
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
  await Notification.insertMany(notifications, { session });

  // Emit notification to all admins and super admins
  adminsAndSuperAdmins.forEach((user, index) => {
    emitSocketEvent(user?._id?.toString(), ChatEvents.NOTIFICATION_EVENT, {
      data: notifications[index],
    });
  });
};

const sendNotificationToUsersFromDB = async (
  url: string,
  message: string,
  excludedUserId: string,
  session: ClientSession,
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

  await Notification.insertMany(notifications, { session });

  // Emit notification to all users
  allUsers.forEach((user, index) => {
    emitSocketEvent(user?._id?.toString(), ChatEvents.NOTIFICATION_EVENT, {
      data: notifications[index],
    });
  });
};

const sendNotificationToUserFromDB = async (
  url: string | null,
  message: string,
  userId: string,
  session: ClientSession,
) => {
  const notification = await Notification.create(
    [
      {
        url,
        message,
        userId,
        isSeen: false,
        isRead: false,
      },
    ],
    { session },
  );

  // Emit notification to a specific
  emitSocketEvent(userId, ChatEvents.NOTIFICATION_EVENT, {
    data: notification,
  });
};

const notifyPropertyCreationFromDB = async (
  propertyId: string,
  session: ClientSession,
) => {
  const message = 'A new property has been listed.';
  const url = `/properties/${propertyId}`; // URL to the property details page

  // Notify all admins and super admins
  await sendNotificationToAdminsFromDB(url, message, session);
};

const notifyPropertyApprovalFromDB = async (
  userId: string,
  propertyId: string,
  session: ClientSession,
) => {
  const approvalMessage = 'Your property has been approved.';
  const newPropertyMessage = 'A new property has been approved and listed.';
  const url = `/properties/${propertyId}`;

  // Notify the user who listed the property
  await sendNotificationToUserFromDB(url, approvalMessage, userId, session);

  // Notify all users
  await sendNotificationToUsersFromDB(url, newPropertyMessage, userId, session);
};

const notifyPropertyRejectionFromDB = async (
  userId: string,
  session: ClientSession,
) => {
  const url = null;
  const message = 'Your property has been rejected.';

  // Notify the user who listed the property
  await sendNotificationToUserFromDB(url, message, userId, session);
};

const notifyPropertyBookingFromDB = async (
  ownerId: string, // User who listed the property (owner)
  bookingUserId: string, // User who booked the property
  propertyId: string, // Booked property ID
  session: ClientSession, // Pass session for transaction
) => {
  // Construct a message and a URL for the property
  const url = `/property/${propertyId}`;
  const message = `Your property has been booked by a user.`;
  const bookingMessage = `You have successfully booked the property.`;

  // Notify the owner of the property
  await sendNotificationToUserFromDB(url, message, ownerId, session);

  // Optional: Notify the booking user as well
  await sendNotificationToUserFromDB(
    url,
    bookingMessage,
    bookingUserId,
    session,
  );
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
  notifyPropertyBookingFromDB,
  getAllNotificationsByIdFromDB,
  markAllNotificationsAsSeenByIdFromDB,
  markAllNotificationsAsReadByIdFromDB,
};
