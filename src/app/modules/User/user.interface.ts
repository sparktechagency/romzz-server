import { GENDER, USER_ROLE, USER_STATUS } from './user.constant';
import { Model, ObjectId } from 'mongoose';

export type TUserRole = keyof typeof USER_ROLE;
export type TGender = keyof typeof GENDER;
export type TUserStatus = keyof typeof USER_STATUS;

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
  role: TUserRole;
  status: 'in-progress' | 'active' | 'blocked' | 'deleted';
  otp: number;
  otpExpiresAt: Date;
  isDeleted: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  toJSON(options?: { includeRole?: boolean }): IUser;
}

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
