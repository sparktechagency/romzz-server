import { errorLogger, logger } from '../utils/winstonLogger';
import colors from 'colors';
import { Facility } from '../modules/Facility/facility.model';

const data = [
  {
    name: 'Swimming Pool',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Gym',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Parking',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'WiFi',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Laundry',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Security',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Garden',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Playground',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Elevator',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
  {
    name: 'Air Conditioning',
    icon: 'https://cdn-icons-png.flaticon.com/128/1829/1829586.png',
  },
];

// Function insert Facility into the database
const seedFacilities = async () => {
  try {
    // Check if there are less than 10 Facility in the database
    const facilityCounts = await Facility.countDocuments();

    if (facilityCounts < 20) {
      // Bulk insert the Facility with hashed passwords
      await Facility.insertMany(data);
      logger.info(colors.bgGreen.bold('✅ Facility inserted successfully!'));
    } else {
      logger.warn(
        colors.bgYellow.bold('⚠️ Facility count is already 10 or more!'),
      );
    }
  } catch (error) {
    errorLogger.error(
      colors.bgRed.bold(`❌ Error inserting Facility:, ${error}`),
    );
  }
};

export default seedFacilities;
