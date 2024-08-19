import config from '../config';
import { USER_ROLE } from '../modules/User/user.constant';

const superUser = {
  fullName: 'Test',
  email: 'test@gmail.com',
  phoneNumber: 123456789,
  nidNumber: 123456789,
  permanentAddress: 'Abc Location',
  gender: 'male',
  password: config.superAdminPassword,
  role: USER_ROLE.superAdmin,
  isVerified: true,
};

export default superUser;
