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
  const totalUsers = await User.countDocuments({
    role: 'USER',
    isVerified: true,
  });

  // Get today's users
  const todayUsers = await User.countDocuments({
    role: 'USER',
    isVerified: true,
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  // Get total bookings
  const totalBookings = await Booking.countDocuments();

  // Get today's bookings
  const todayBookings = await Booking.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  // Aggregate total revenue from subscriptions
  const totalSubscriptionRevenueResult = await Subscription.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amountPaid' },
      },
    },
  ]);
  const totalSubscriptionRevenue =
    totalSubscriptionRevenueResult[0]?.totalRevenue || 0;

  // Aggregate total revenue from bookings
  const totalBookingRevenueResult = await Booking.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$adminFee' },
      },
    },
  ]);
  const totalBookingRevenue = totalBookingRevenueResult[0]?.totalRevenue || 0;

  // Get total revenue
  const totalRevenue = totalSubscriptionRevenue + totalBookingRevenue;

  // Aggregate today's revenue from subscriptions
  const todaySubscriptionRevenueResult = await Subscription.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        todayRevenue: { $sum: '$amountPaid' },
      },
    },
  ]);
  const todaySubscriptionRevenue =
    todaySubscriptionRevenueResult[0]?.todayRevenue || 0;

  // Aggregate today's revenue from bookings
  const todayBookingRevenueResult = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        todayRevenue: { $sum: '$adminFee' },
      },
    },
  ]);
  const todayBookingRevenue = todayBookingRevenueResult[0]?.todayRevenue || 0;

  // Get today's total revenue
  const todayRevenue = todaySubscriptionRevenue + todayBookingRevenue;

  return {
    totalUsers,
    todayUsers,
    totalBookings,
    todayBookings,
    totalRevenue,
    todayRevenue,
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
