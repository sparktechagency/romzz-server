import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { User } from '../User/user.model';
import { monthNames } from '../../constants/monthNames.constant';
import { Subscription } from '../Subscription/subscription.model';
import { Booking } from '../Booking/booking.model';

const getDashboardMetricsFromDB = async () => {
  // Get today's start and end dates
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // Get total users
  const totalUser = await User.countDocuments({
    role: 'USER',
    isVerified: true,
  });

  const todayUser = await User.countDocuments({
    role: 'USER',
    isVerified: true,
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  // Get total donors
  const totalDoner = await Payment.countDocuments();

  // Get donors created today
  const todayDoner = await Payment.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  // Get total donation amount
  const totalDonationResult = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
  const totalDonation = totalDonationResult[0]?.totalAmount || 0;

  // Get donations created today
  const todayDonationResult = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        todayAmount: { $sum: '$amount' },
      },
    },
  ]);
  const todayDonation = todayDonationResult[0]?.todayAmount || 0;

  return {
    totalUser,
    todayUser,
    totalDoner,
    todayDoner,
    totalDonation,
    todayDonation,
  };
};

const getUserCountsByYearFromDB = async (year: number) => {
  const monthlyUserCounts = [];

  for (let month = 1; month <= 12; month++) {
    // Define the start and end dates for the current month
    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = endOfMonth(new Date(year, month - 1, 1));

    // Aggregate user counts for the specified month
    const userCounts = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          role: 'USER',
          isVerified: true,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    // Add the result to monthly User Counts
    monthlyUserCounts.push({
      month: monthNames[month - 1],
      totalUsers: userCounts?.length > 0 ? userCounts[0]?.count : 0,
    });
  }

  return monthlyUserCounts;
};

const getRevenueCountsByYearFromDB = async (year: number) => {
  const monthlyRevenueCounts = [];

  for (let month = 1; month <= 12; month++) {
    // Define the start and end dates for the current month
    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = endOfMonth(new Date(year, month - 1, 1));

    // Aggregate revenue from subscriptions
    const subscriptionRevenue = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountPaid' },
        },
      },
    ]);

    // Aggregate revenue from bookings
    const bookingRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$adminFee' },
        },
      },
    ]);

    // Calculate the total revenue for the current month
    const totalRevenue =
      (subscriptionRevenue.length > 0
        ? subscriptionRevenue[0].totalRevenue
        : 0) + (bookingRevenue.length > 0 ? bookingRevenue[0].totalRevenue : 0);

    // Add the result to monthly revenue counts
    monthlyRevenueCounts.push({
      month: monthNames[month - 1], // Ensure monthNames is defined or use a similar list
      totalRevenue,
    });
  }

  return monthlyRevenueCounts;
};

export const DashboardServices = {
  getDashboardMetricsFromDB,
  getUserCountsByYearFromDB,
  getRevenueCountsByYearFromDB,
};
