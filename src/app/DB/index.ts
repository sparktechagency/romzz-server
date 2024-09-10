import config from '../config';
import { User } from '../modules/User/user.model';
import logger from '../logger/winston.logger';
import colors from 'colors';

const superAdmin = {
  fullName: config.superAdminFullName,
  email: config.superAdminEmail,
  password: config.superAdminPassword,
  role: config.superAdminRole,
  isVerified: config.superAdminIsVerified,
  status: config.superAdminStatus,
};

const seedSuperAdmin = async () => {
  try {
    //when database is connected, we will check is there any user who is super admin
    const isSuperAdminExits = await User.findOne({
      role: config.superAdminRole,
    });

    if (!isSuperAdminExits) {
      await User.create(superAdmin);
      logger.info(colors.bgGreen.bold('✅ Super admin created successfully!'));
    } else {
      logger.warn(
        colors.bgYellow.bold(
          '⚠️ Super admin already exists, no need to create!',
        ),
      );
    }
  } catch (error) {
    logger.error(colors.bgRed.bold(`❌ Error seeding super admin:, ${error}`));
  }
};

export default seedSuperAdmin;
