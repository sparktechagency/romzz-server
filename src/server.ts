import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import seedSuperAdmin from './app/DB';

let server: Server;

async function main() {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.dbURL}/${config.collectionName}`,
    );
    seedSuperAdmin();

    console.log(
      `MongoDB Connected! DB Host: ${connectionInstance.connection.host}`,
    );

    server = app.listen(Number(config.port), config.ipAddress as string, () => {
      console.log(`App is listening on port ${config.port}`);
    });
  } catch (error) {
    console.log('MongoDB Error', error);
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
