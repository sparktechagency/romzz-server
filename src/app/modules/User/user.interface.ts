import { GENDER, USER_ROLE, USER_STATUS } from './user.constant';
import { Model, ObjectId } from 'mongoose';

// Define type for user roles based on constants
export type TUserRole = keyof typeof USER_ROLE;
// Define type for user status based on constants
export type TUserStatus = keyof typeof USER_STATUS;
// Define type for gender based on constants
export type TGender = keyof typeof GENDER;

// Interface representing the structure of a User document in MongoDB
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
  isUserExistsByEmail(email: string): Promise<IUser>; // Static method to check if a user exists by email

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>; // Static method to compare plaintext password with stored hashed password

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTime: Date,
    jwtIssuedTime: number,
  ): Promise<boolean>; // Static method to check if a JWT was issued before the password was changed

  verifyOtp(email: string, otp: number): Promise<boolean>; // Static method to verify OTP for a user
}
