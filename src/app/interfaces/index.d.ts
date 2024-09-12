/* eslint-disable no-var */

import { JwtPayload } from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }

  namespace SocketIO {
    interface Socket {
      user?: IUser; // Use the type of your user object
    }
  }

  // Declare global `io` variable directly for Node.js
  declare var io: SocketIOServer;
}
