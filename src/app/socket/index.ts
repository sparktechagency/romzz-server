import { Server } from 'socket.io';
import colors from 'colors';
import logger from '../logger/winston.logger';

const initializeSocket = (io: Server) => {
  io.on('connection', (socket) => {
    logger.info(colors.bgBlue.bold(`A User is connected: ${socket?.id}`));

    //disconnect
    socket.on('disconnect', () => {
      logger.warn(colors.bgYellow.bold(`A User is disconnected: ${socket.id}`));
    });
  });
};

export { initializeSocket };
