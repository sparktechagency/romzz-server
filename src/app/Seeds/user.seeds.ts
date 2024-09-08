import { User } from '../modules/User/user.model';
import { errorLogger, logger } from '../utils/winstonLogger';
import colors from 'colors';
import { faker } from '@faker-js/faker';
import config from '../config';
import bcrypt from 'bcrypt';

const USERS_COUNT = 30; // Number of users to seed

// Generate fake users data
const generateFakeUsers = async () => {
  return Promise.all(
    Array.from({ length: USERS_COUNT }, async () => ({
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      phoneNumber: faker.phone.number(),
      nidNumber: faker.number.int({ min: 10000000, max: 9999999999 }),
      gender: faker.person.sex(),
      permanentAddress: faker.location.streetAddress({ useFullAddress: true }),
      password: await bcrypt.hash(
        faker.internet.password(),
        Number(config.bcryptSaltRounds),
      ),
      role: 'USER',
      status: 'active',
      isVerified: true,
    })),
  );
};

const seedUsers = async () => {
  try {
    const usersCount = await User.countDocuments();

    if (usersCount < USERS_COUNT) {
      const fakeUsers = await generateFakeUsers();
      await User.insertMany(fakeUsers);
      logger.info(colors.bgGreen.bold('✅ Users inserted successfully!'));
    } else {
      logger.warn(
        colors.bgYellow.bold(
          `⚠️ User count is already ${USERS_COUNT} or more!`,
        ),
      );
    }
  } catch (error) {
    errorLogger.error(colors.bgRed.bold(`❌ Error inserting users: ${error}`));
  }
};

export default seedUsers;
