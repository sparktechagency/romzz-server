import { GENDER, USER_ROLE, USER_STATUS } from './user.constant';
import { Model, ObjectId } from 'mongoose';

// Type definitions based on user constants
export type TUserRole = keyof typeof USER_ROLE;
export type TUserStatus = keyof typeof USER_STATUS;
export type TGender = keyof typeof GENDER;

// Interface representing a User document in MongoDB
export interface IUser {
  _id: ObjectId;
  fullName: string;
  email: string;
  avatar: string;
  coverImage: string;
  phoneNumber: string;
  nidNumber: number;
  ineNumber: number;
  gender: TGender;
  password: string;
  passwordChangedAt: Date;
  permanentAddress: string;
  presentAddress: string;
  role: TUserRole;
  status: TUserStatus;
  otp: number;
  otpExpiresAt: Date;
  isDeleted: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  toJSON(options?: { includeRole?: boolean }): IUser;
}

// Interface for the User model methods
export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser>; // Check if a user exists by email

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>; // Compare a plaintext password with a hashed password

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTime: Date,
    jwtIssuedTime: number,
  ): Promise<boolean>; // Check if a JWT was issued before the last password change

  verifyOtp(email: string, otp: number): Promise<boolean>; // Verify OTP for user authentication
}
