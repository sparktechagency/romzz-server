import { User } from '../modules/User/user.model';
import { errorLogger, logger } from '../utils/winstonLogger';
import colors from 'colors';
import { faker } from '@faker-js/faker';
import config from '../config';
import bcrypt from 'bcrypt';

const USERS_COUNT = 30; // Define the count of users to seed

// Array of fake users
const users = new Array(USERS_COUNT).fill('_').map(() => ({
  fullName: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  phoneNumber: faker.phone.number(),
  nidNumber: faker.number.int({ min: 10000000, max: 9999999999 }),
  gender: faker.person.sex(),
  permanentAddress: faker.location.streetAddress({ useFullAddress: true }),
  password: faker.internet.password(),
  role: 'USER',
  status: 'active',
  isVerified: true,
}));

// Function to hash passwords and insert users into the database
const seedUsers = async () => {
  try {
    // Hash passwords for each user
    const hashedUsers = await Promise.all(
      users?.map(async (user) => {
        const hashedPassword = await bcrypt.hash(
          user.password,
          Number(config.bcryptSaltRounds),
        );
        return { ...user, password: hashedPassword }; // Replace plain password with hashed one
      }),
    );

    // Check if there are less than 20 users in the database
    const usersCount = await User.countDocuments();

    if (usersCount < USERS_COUNT) {
      // Bulk insert the users with hashed passwords
      await User.insertMany(hashedUsers);
      logger.info(colors.bgGreen.bold('✅ Users inserted successfully!'));
    } else {
      logger.warn(colors.bgYellow.bold('⚠️ User count is already 20 or more!'));
    }
  } catch (error) {
    errorLogger.error(colors.bgRed.bold(`❌ Error inserting users:, ${error}`));
  }
};

export default seedUsers;
