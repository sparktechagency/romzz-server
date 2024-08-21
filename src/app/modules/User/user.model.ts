import { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

// Define the schema for the User model
const userSchema = new Schema<IUser, UserModel>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    coverImage: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    nidNumber: {
      type: Number,
      required: true,
    },
    ineNumber: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'others'],
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    passwordChangedAt: {
      type: Date,
    },
    permanentAddress: {
      type: String,
      required: true,
    },
    presentAddress: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked', 'deleted'],
      default: 'in-progress',
    },
    otp: {
      type: Number,
    },
    otpExpiresAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }, // Adds createdAt and updatedAt timestamps
);

// Middleware: Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  // Hash the password using bcrypt before saving
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds),
  );
  next();
});

// Method to remove sensitive fields before returning user object as JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  // Remove password and role fields from the user object
  delete userObject?.password;
  delete userObject?.passwordChangedAt;
  delete userObject?.role;
  delete userObject?.status;
  delete userObject?.isBlocked;
  delete userObject?.isDeleted;
  delete userObject?.isVerified;
  delete userObject?.otp;
  delete userObject?.otpExpiresAt;

  return userObject;
};

// Static method to check if a user with the given email exists
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  // Find a user with the given email
  const existingUser = await User.findOne({ email }).select('+password');
  return existingUser;
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedAt: Date,
  jwtIssuedTime: number,
) {
  const passwordChangedTime = new Date(passwordChangedAt).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTime;
};

// Static method to verify the OTP
userSchema.statics.verifyOtp = async function (email: string, otp: number) {
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  if (!otp) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      'Please give the otp, check your email we send a code!',
    );
  }

  if (
    !existingUser ||
    !existingUser?.otpExpiresAt ||
    existingUser?.otpExpiresAt < new Date()
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Otp already expired, Please try again!',
    );
  }

  if (existingUser?.otp !== otp) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Invalid OTP!');
  }

  // If OTP is correct, update specific fields
  await User.updateOne(
    { email },
    {
      $unset: {
        otp: '', // Remove the OTP field
        otpExpiresAt: '', // Remove the OTP expiration date field
      },
      $set: {
        isVerified: true, // Set the user as verified
      },
    },
  );

  return null;
};

// Create the User model using the schema
export const User = model<IUser, UserModel>('User', userSchema);
