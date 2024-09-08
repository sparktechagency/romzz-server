import { faker } from '@faker-js/faker';
import { Property } from '../modules/Property/property.model';
import { errorLogger, logger } from '../logger/winstonLogger';
import colors from 'colors';
import {
  ALLOWED_GENDER,
  BED_TYPE,
  CATEGORY,
  DECORATION_TYPE,
  GUEST_TYPE,
  OCCUPATION,
  OWNER_TYPE,
  PRICE_TYPE,
  PROPERTY_TYPE,
} from '../modules/Property/property.constant';
import { User } from '../modules/User/user.model';
import { Facility } from '../modules/Facility/facility.model';

const PROPERTIES_COUNT = 30; // Number of properties to seed

// Function to randomly select a number of elements from an array
const getRandomElements = (array: string[], min: number, max: number) => {
  const count = faker.number.int({ min, max });
  const shuffled = array.sort(() => 0.5 - Math.random()); // Shuffle array
  return shuffled.slice(0, count); // Select random elements
};

// Generate fake property data with userId for createdBy field
const generateFakeProperty = (userId: string, facilityIds: string[]) => ({
  createdBy: userId,
  ownerNumber: faker.phone.number(),
  title: faker.lorem.words(3),
  address: faker.location.streetAddress({ useFullAddress: true }),
  ownershipImages: [faker.image.avatar, faker.image.avatar],
  description: faker.lorem.paragraph(),
  propertyImages: [
    faker.image.avatar,
    faker.image.avatar,
    faker.image.avatar,
    faker.image.avatar,
    faker.image.avatar,
  ],
  propertyVideo: faker.internet.url(),

  occupation: faker.helpers.arrayElement(Object.values(OCCUPATION)), // Random occupation
  guestType: faker.helpers.arrayElement(Object.values(GUEST_TYPE)), // Random guest type
  allowedGender: faker.helpers.arrayElement(Object.values(ALLOWED_GENDER)), // Random allowed gender
  propertyType: faker.helpers.arrayElement(Object.values(PROPERTY_TYPE)), // Random property type
  decorationType: faker.helpers.arrayElement(Object.values(DECORATION_TYPE)), // Random decoration type
  priceType: faker.helpers.arrayElement(Object.values(PRICE_TYPE)), // Random price type
  ownerType: faker.helpers.arrayElement(Object.values(OWNER_TYPE)), // Random owner type
  category: faker.helpers.arrayElement(Object.values(CATEGORY)), // Random category
  bedType: faker.helpers.arrayElement(Object.values(BED_TYPE)), // Random bed type,

  price: faker.number.int({ min: 1000, max: 50000 }), // Random price
  size: `${faker.number.int({ min: 500, max: 3000 })} sq ft`, // Random size
  flore: `${faker.number.int({ min: 1, max: 10 })}`, // Random floor number
  bedrooms: faker.number.int({ min: 1, max: 5 }), // Random number of bedrooms
  bathrooms: faker.number.int({ min: 1, max: 5 }), // Random number of bathrooms
  balcony: faker.number.int({ min: 0, max: 2 }), // Random number of balconies
  kitchen: faker.number.int({ min: 1, max: 2 }), // Random number of kitchens
  dining: faker.number.int({ min: 1, max: 2 }), // Random number of dining areas
  drawing: faker.number.int({ min: 1, max: 2 }), // Random number of drawing rooms
  moveOn: faker.date.future().toISOString(),
  unavailableDay: [faker.date.future().toISOString()],
  facilities: getRandomElements(facilityIds, 5, 8),
  isApproved: true,
  status: 'approved',
});

// Function insert Property into the database
const seedProperties = async () => {
  try {
    // Fetch user IDs
    const users = await User.find();
    const userIds = users.map((user) => user._id.toString());

    // Fetch facility IDs
    const facilities = await Facility.find();
    const facilityIds = facilities.map((facility) => facility._id.toString());

    // Check if there are less than 10 Property in the database
    const propertiesCount = await Property.countDocuments();

    if (propertiesCount < PROPERTIES_COUNT) {
      // Generate fake property data
      const fakeProperties = Array.from(
        { length: PROPERTIES_COUNT - propertiesCount },
        () => {
          // Randomly select a userId for the property
          const randomUserId = faker.helpers.arrayElement(userIds);
          return generateFakeProperty(randomUserId, facilityIds);
        },
      );

      // Bulk insert the Property with hashed passwords
      await Property.insertMany(fakeProperties);
      logger.info(colors.bgGreen.bold('✅ Property inserted successfully!'));
    } else {
      logger.warn(
        colors.bgYellow.bold(
          `⚠️ Property count is already ${PROPERTIES_COUNT} or more!`,
        ),
      );
    }
  } catch (error) {
    errorLogger.error(
      colors.bgRed.bold(`❌ Error inserting Property:, ${error}`),
    );
  }
};

export default seedProperties;
