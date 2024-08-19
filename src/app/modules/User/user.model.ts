import { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';

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
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
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

// Static method to generate and store OTP
userSchema.statics.generateOtp = async function (userId: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  await User.findByIdAndUpdate(userId, { otp, otpExpiresAt });

  // Here you would typically send the OTP to the user's email or phone number

  return otp;
};

// Static method to verify the OTP
userSchema.statics.verifyOtp = async function (userId: string, otp: number) {
  const user = await User.findById(userId);

  if (!user || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new Error('OTP has expired.');
  }

  if (user.otp !== otp) {
    throw new Error('Invalid OTP.');
  }

  // If the OTP is correct, you can proceed to verify the user
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  return true;
};

// Create the User model using the schema
export const User = model<IUser, UserModel>('User', userSchema);
