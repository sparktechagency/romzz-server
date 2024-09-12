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

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      // Verify the JWT token
      const decoded = verifyJwtToken(token, config.jwtAccessSecret as string);

      // Find the user associated with the token
      const existingUser = await User.findById(decoded?.userId).select(
        '_id email isVerified isBlocked passwordChangedAt',
      );

      if (!existingUser) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `User with ID: ${decoded?.userId} not found!`,
        );
      }

      // Check if the user's account is verified and not blocked
      if (!existingUser?.isVerified) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'User account is not verified!',
        );
      }

      // If the user is blocked, throw a FORBIDDEN error.
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

      // Join a room specific to the user
      socket.join(existingUser?._id?.toString());

      // Emit a connection event to the client
      socket.emit(ChatEvents.CONNECTED_EVENT);

      logger.info(
        colors.bgGreen.bold(`✅ A User is connected: ${existingUser?._id}`),
      );

      socket.on(ChatEvents.DISCONNECT_EVENT, () => {
        logger.warn(
          colors.bgYellow.bold(
            `🚫 A User is disconnected: ${existingUser?._id}`,
          ),
        );
      });
    } catch (error) {
      socket.emit(
        ChatEvents.SOCKET_ERROR_EVENT,
        error || 'Something went wrong while connecting to the socket.',
      );
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
