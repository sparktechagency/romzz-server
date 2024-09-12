import { Server } from 'socket.io';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import { User } from '../modules/User/user.model';
import { verifyJwtToken } from '../helpers/tokenUtils';
import config from '../config';
import logger from '../logger/winston.logger';
import colors from 'colors';
import { ChatEvents } from '../constants/chat.constant';

const initializeSocket = (io: Server) => {
  return io.on('connection', async (socket) => {
    try {
      // Extract the JWT token from the authorization header
      const token = socket.handshake.headers.authorization?.split(' ')[1];

      // Check if the token is present
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      // Verify the JWT token
      const decoded = verifyJwtToken(token, config.jwtAccessSecret as string);

      // Find the user associated with the token
      const existingUser = await User.findById(decoded?.userId).select(
        '_id email isVerified isBlocked passwordChangedAt',
      );

      // Check if the user exists
      if (!existingUser) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `User with ID: ${decoded?.userId} not found!`,
        );
      }

      // Check if the user's account is verified
      if (!existingUser?.isVerified) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'User account is not verified!',
        );
      }

      // Check if the user's account is blocked
      if (existingUser?.isBlocked) {
        throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
      }

      // Check if the JWT token is still valid based on password changes
      if (
        existingUser.passwordChangedAt &&
        (await User.isJWTIssuedBeforePasswordChanged(
          existingUser?.passwordChangedAt,
          decoded?.iat as number,
        ))
      ) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      // Emit a connection event to the client
      socket.emit(ChatEvents.CONNECTED_EVENT);

      // Join a room specific to the user to handle their messages and events
      socket.join(existingUser?._id?.toString());

      // Log the successful connection
      logger.info(
        colors.bgGreen.bold(`✅ User is connected: ${existingUser?._id}`),
      );

      // Handle disconnection events
      socket.on(ChatEvents.DISCONNECT_EVENT, () => {
        logger.warn(
          colors.bgYellow.bold(`🚫 User is disconnected: ${existingUser?._id}`),
        );
      });
    } catch (error) {
      // Log and emit an error if something goes wrong
      logger.error(colors.bgRed.bold(`Error connecting user: ${error}`));
      socket.emit(
        ChatEvents.SOCKET_ERROR_EVENT,
        error || 'Something went wrong while connecting to the socket.',
      );
      // Disconnect the socket to terminate the connection on error
      socket.disconnect();
    }
  });
};

const emitSocketEvent = (
  roomId: string,
  event: string,
  payload: Record<string, unknown>,
) => {
  io.in(roomId).emit(event, payload);
};

export { initializeSocket, emitSocketEvent };
