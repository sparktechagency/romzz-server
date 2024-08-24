import { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { GENDER, USER_ROLE, USER_STATUS } from './user.constant';

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
    },
    nidNumber: {
      type: Number,
    },
    ineNumber: {
      type: Number,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
    },
    password: {
      type: String,
      required: true,
      select: 0, // Exclude password from query results by default
    },
    passwordChangedAt: {
      type: Date,
    },
    permanentAddress: {
      type: String,
    },
    presentAddress: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: 'user',
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
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
  { timestamps: true }, // Automatically manage createdAt and updatedAt
);

// Pre-save middleware to hash the password before saving the user document
userSchema.pre('save', async function (next) {
  // Hash the password using bcrypt if it has been modified
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds),
  );
  next();
});

// Method to remove sensitive fields before converting to JSON
userSchema.methods.toJSON = function (options?: { includeRole?: boolean }) {
  const userObject = this.toObject();

  // Exclude sensitive fields
  delete userObject?.password;
  delete userObject?.passwordChangedAt;
  delete userObject?.status;
  delete userObject?.isBlocked;
  delete userObject?.isDeleted;
  delete userObject?.isVerified;
  delete userObject?.otp;
  delete userObject?.otpExpiresAt;

  if (!options?.includeRole) {
    delete userObject?.role; // Remove role if not needed
  }

  return userObject;
};

// Static method to check if a user with the given email exists
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password'); // Include password field in query result
};

// Static method to compare plain text password with hashed password
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// Static method to check if the JWT was issued before the password was changed
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedAt: Date,
  jwtIssuedTime: number,
) {
  const passwordChangedTime = new Date(passwordChangedAt).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTime;
};

// Static method to verify the OTP sent to the user's email
userSchema.statics.verifyOtp = async function (email: string, otp: number) {
  const existingUser = await User.findOne({ email });

  if (!otp) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'OTP is required. Please check your email for the code.',
    );
  }

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  if (!existingUser?.otpExpiresAt || existingUser?.otpExpiresAt < new Date()) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'OTP has expired. Please request a new one.',
    );
  }

  if (existingUser?.otp !== otp) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Incorrect OTP. Please try again!',
    );
  }

  // If OTP is correct, remove OTP fields and verify the user
  await User.findByIdAndUpdate(existingUser._id, {
    $unset: {
      otp: '', // Remove OTP field
      otpExpiresAt: '', // Remove OTP expiration field
    },
    $set: {
      isVerified: true, // Set user as verified
      status: 'active', // Update user status to active
    },
  });

  return null;
};

// Create the User model using the schema
export const User = model<IUser, UserModel>('User', userSchema);
