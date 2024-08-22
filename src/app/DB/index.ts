import config from '../config';
import { User } from '../modules/User/user.model';

const superUser = {
  fullName: config.superAdminFullName,
  email: config.superAdminEmail,
  phoneNumber: config.superAdminPhoneNumber,
  nidNumber: config.superAdminNidNumber,
  permanentAddress: config.superAdminPermanentAddress,
  gender: config.superAdminGender,
  password: config.superAdminPassword,
  role: config.superAdminRole,
  isVerified: config.superAdminIsVerified,
};

const seedSuperAdmin = async () => {
  //when database is connected, we will check is there any user who is super admin
  const isSuperAdminExits = await User.findOne({ role: config.superAdminRole });

  if (!isSuperAdminExits) {
    await User.create(superUser);
  }
};

export default seedSuperAdmin;
