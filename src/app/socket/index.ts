import { Server } from 'socket.io';
import colors from 'colors';
import { logger } from '../logger/winstonLogger';

const initializeSocket = (io: Server) => {
  io.on('connection', (socket) => {
    logger.info(colors.bgBlue.bold('A user connected'));

    //disconnect
    socket.on('disconnect', () => {
      logger.warn(colors.bgYellow.bold('A user disconnect'));
    });
  });
};

export { initializeSocket };
