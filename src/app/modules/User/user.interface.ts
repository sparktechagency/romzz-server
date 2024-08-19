import { Model, ObjectId } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface IUser {
  _id: ObjectId;
  fullName: string;
  email: string;
  avatar: string;
  phoneNumber: string;
  nidNumber: number;
  gender: 'male' | 'female' | 'others';
  password: string;
  permanentAddress: string;
  role: 'user' | 'admin' | 'super-admin';
  status: 'in-progress' | 'blocked' | 'deleted';
  isDeleted: boolean;
  isBlocked: boolean;
  isVerified: boolean;
}

export type TUserRole = keyof typeof USER_ROLE;

// for creating a static
export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser | null>;
}
