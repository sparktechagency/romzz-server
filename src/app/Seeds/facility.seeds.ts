import { errorLogger, logger } from '../utils/winstonLogger';
import colors from 'colors';
import { Facility } from '../modules/Facility/facility.model';
import { faker } from '@faker-js/faker';

const FACILITIES_COUNT = 10; // Number of facilities to seed

// Generate fake facility data
const generateFakeFacilities = () => {
  return Array.from({ length: FACILITIES_COUNT }, () => ({
    name: faker.lorem.word(),
    icon: faker.image.avatar(),
  }));
};

// Function to insert facilities into the database
const seedFacilities = async () => {
  try {
    const existingFacilitiesCount = await Facility.countDocuments();

    if (existingFacilitiesCount < FACILITIES_COUNT) {
      const fakeFacilities = generateFakeFacilities();
      await Facility.insertMany(fakeFacilities);
      logger.info(colors.bgGreen.bold('✅ Facilities inserted successfully!'));
    } else {
      logger.warn(
        colors.bgYellow.bold('⚠️ Facility count is already 10 or more!'),
      );
    }
  } catch (error) {
    errorLogger.error(
      colors.bgRed.bold(`❌ Error inserting facilities: ${error}`),
    );
  }
};

export default seedFacilities;
