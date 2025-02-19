/* eslint-disable @typescript-eslint/no-unused-vars */

import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import requestLogger from './app/logger/morgan.logger';
import handleStripeWebhook from './app/webhooks/handleStripeWebhook';
import requestIp from 'request-ip';
import rateLimit from 'express-rate-limit';
import ApiError from './app/errors/ApiError';
import httpStatus from 'http-status';
import config from './app/config';

const app = express();

// Middleware setup
app.use(cors({
  origin: ['http://10.0.70.92:3000', "http://10.0.70.92:3001", "http://10.0.70.92:3006", 'http://localhost:3000', "http://142.93.43.249:4173", "http://142.93.43.249:3000"], // Replace with your frontend domain
  credentials: true // Allow credentials to be sent
}));
app.use(cookieParser());
app.use(requestIp.mw());

// Rate limiter to prevent abuse (max 1000 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    if (!req.clientIp) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Unable to determine client IP!',
      );
    }

    return req.clientIp;
  },
  handler: (req, res, next, options) => {
    throw new ApiError(
      options?.statusCode,
      `Rate limit exceeded. Try again in ${options.windowMs / 60000} minutes.`,
    );
  },
});

// Stripe webhook route
app.use(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

// Apply rate limiter and setup body parsers
app.use(limiter);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static files
app.use(express.static('public'));

// Request logging
app.use(requestLogger);

// Root route - API status check
app.get('/', (req: Request, res: Response) => {
  const serverStatus = {
    status: 'running',
    message: 'Romzz API is operational and running smoothly.',
    timestamp: new Date().toISOString(),
    version: 'v1.0.1',
    uptime: process.uptime(),
    environment: config.nodeEnv,
    databaseStatus: 'connected',
    healthCheck: 'Healthy',
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    author: {
      name: 'Ibrahim Khalil',
      email: 'iibrahiim.dev@gmail.com',
      website: 'https://iibrahim-dev.netlify.app/',
    },
  };

  res.json(serverStatus);
});

// API routes
app.use('/api/v1', router);

// Error-handling middlewares
app.use(globalErrorHandler); // Global error handler middleware
app.use(notFound); // Middleware to handle 404 - Not Found errors

export default app;
