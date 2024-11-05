/* eslint-disable @typescript-eslint/no-explicit-any */
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
      default: 'https://i.pinimg.com/564x/b2/66/f7/b266f7c8ecb53960c5eaa19d2a40dc41.jpg',
    },
    coverImage: {
      type: String,
      default: "https://www.investopedia.com/thmb/XPnvXjFTJnA8j8VBEtNc7DfduN4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/INV_Real_Property_GettyImages-200478960-001-080ea7835ec1444881eddbe3b2a5a632.jpg"
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
      select: 0, // Exclude password by default
    },
    stripeAccountInfo: {
      accountId: {
        type: String,
      },
      loginUrl: {
        type: String,
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    permanentLocation: {
      address: {
        type: String,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    presentLocation: {
      address: {
        type: String,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    rating: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: 'USER',
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
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    hasAccess: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt fields
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is new or changed
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds),
  );

  // Remove rating field if the role is admin or superadmin
  if (this.role === USER_ROLE['SUPER-ADMIN'] || this.role === USER_ROLE.ADMIN) {
    this.set('rating', undefined, { strict: false }); // Remove rating
  }
  next();
});

// Remove sensitive fields before converting to JSON
userSchema.methods.toJSON = function (options?: { includeRole?: boolean }) {
  const userObject = this.toObject();

  // Remove sensitive fields
  delete userObject?.password;
  delete userObject?.passwordChangedAt;
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

// Check if a user exists by email
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password'); // Include password in results
};

// Compare plain text password with hashed password
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword:any,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// Check if JWT was issued before password change
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedAt: Date,
  jwtIssuedTime: number,
) {
  const passwordChangedTime = new Date(passwordChangedAt).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTime;
};

// Verify OTP for user authentication
userSchema.statics.verifyOtp = async function (email: string, otp: number) {
  const existingUser = await User.isUserExistsByEmail(email);

  // Validate OTP input
  if (!otp) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'OTP is required. Please check your email for the code!',
    );
  }

  // Check if user exists
  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Verify OTP expiration
  if (!existingUser?.otpExpiresAt || existingUser?.otpExpiresAt < new Date()) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'OTP has expired. Please request a new one!',
    );
  }

  // Check if OTP matches
  if (existingUser?.otp !== otp) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Incorrect OTP. Please try again!',
    );
  }

  // If OTP is correct, remove OTP fields and verify the user
  await User.findByIdAndUpdate(existingUser?._id, {
    $unset: {
      otp: '',
      otpExpiresAt: '',
    },
    $set: {
      isVerified: true,
      status: 'active',
    },
  });

  return null;
};

// Create the User model using the schema
export const User = model<IUser, UserModel>('User', userSchema);
