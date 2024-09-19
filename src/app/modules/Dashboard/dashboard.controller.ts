import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardServices } from './dashboard.service';

const getDashboardMetrics = catchAsync(async (req, res) => {
  const result = await DashboardServices.getDashboardMetricsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard metrics retrieved successfully!',
    data: result,
  });
});

const getUserCountsByYear = catchAsync(async (req, res) => {
  const result = await DashboardServices.getUserCountsByYearFromDB(
    Number(req?.params?.year),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Monthly user counts for ${req?.params?.year} retrieved successfully!`,
    data: result,
  });
});

const getRevenueCountsByYear = catchAsync(async (req, res) => {
  const result = await DashboardServices.getRevenueCountsByYearFromDB(
    Number(req?.params?.year),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Monthly revenue counts for ${req?.params?.year} retrieved successfully!`,
    data: result,
  });
});

export const DashboardControllers = {
  getDashboardMetrics,
  getUserCountsByYear,
  getRevenueCountsByYear,
};
