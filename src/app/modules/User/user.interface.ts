import { Model, ObjectId } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface IUser {
  _id: ObjectId;
  fullName: string;
  email: string;
  avatar: string;
  coverImage: string;
  phoneNumber: string;
  nidNumber: number;
  ineNumber: number;
  gender: 'male' | 'female' | 'others';
  password: string;
  passwordChangedAt: Date;
  permanentAddress: string;
  presentAddress: string;
  role: 'user' | 'admin' | 'super-admin';
  status: 'in-progress' | 'active' | 'blocked' | 'deleted';
  otp: number;
  otpExpiresAt: Date;
  isDeleted: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  toJSON(options?: { includeRole?: boolean }): IUser;
}

export type TUserRole = keyof typeof USER_ROLE;

// for creating a static
export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTime: Date,
    jwtIssuedTime: number,
  ): Promise<boolean>;

  verifyOtp(email: string, otp: number): Promise<boolean>;
}
