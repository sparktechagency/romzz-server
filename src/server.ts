import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import seedSuperAdmin from './app/DB';
import logger from './app/logger/winston.logger';
import colors from 'colors';
import seedUsers from './app/seeds/user.seeds';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { initializeSocket } from './app/socket';

let server: HttpServer;

async function main() {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.dbURL}/${config.collectionName}`,
    );

    // Seed data
    seedSuperAdmin();
    seedUsers();
    // seedFacilities();
    // seedProperties();

    logger.info(
      colors.bgGreen.bold(
        `✅ Database Connected! Host: ${connectionInstance?.connection?.host}`,
      ),
    );

    server = app.listen(Number(config.port), config.ipAddress as string, () => {
      logger.info(
        colors.bgGreen.bold(
          `🚀 Server running on: ${config.ipAddress}:${config.port}`,
        ),
      );
    });

    // Create HTTP server and Socket.io server
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: config.corsOrigin,
        credentials: true,
      },
    });

    initializeSocket(io);
    global.io = io;
  } catch (error) {
    logger.error(colors.bgCyan.bold(`❌ MongoDB connection error: ${error}`));
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', (error) => {
  logger.error(
    colors.bgYellow.bold(`⚠️ Unhandled rejection, shutting down... ${error}`),
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(
    colors.bgRed.bold(`❌ Uncaught exception: ${error}, shutting down...`),
  );
  process.exit(1);
});
