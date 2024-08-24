import config from '../config';
import { User } from '../modules/User/user.model';

const superAdmin = {
  fullName: config.superAdminFullName,
  email: config.superAdminEmail,
  password: config.superAdminPassword,
  role: config.superAdminRole,
  isVerified: config.superAdminIsVerified,
  status: config.superAdminStatus,
};

const seedSuperAdmin = async () => {
  //when database is connected, we will check is there any user who is super admin
  const isSuperAdminExits = await User.findOne({ role: config.superAdminRole });

  if (!isSuperAdminExits) {
    await User.create(superAdmin);
  }
};

export default seedSuperAdmin;
