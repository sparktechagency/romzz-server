import { Request, Response } from 'express';
import config from '../config';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import logger from '../logger/winston.logger';
import colors from 'colors';
import {
  handleAccountUpdatedEvent,
  handleSubscriptionCreated,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from '../handlers';

const handleStripeWebhook = async (req: Request, res: Response) => {
  // Extract Stripe signature and webhook secret
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripeWebhookSecret as string;

  let event: Stripe.Event | undefined;

  // Verify the event signature
  try {
    // Use raw request body for verification
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    // Return an error if verification fails
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed. ${error}`,
    );
  }

  // Check if the event is valid
  if (!event) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid event received!');
  }

  // Extract event data and type
  const data = event.data.object as Stripe.Subscription | Stripe.Account;
  const eventType = event.type;

  // Handle the event based on its type
  try {
    switch (eventType) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data as Stripe.Subscription);
        console.log("subscribe new package", data)
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(data as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(data as Stripe.Subscription);
        break;

      case 'account.updated':
        await handleAccountUpdatedEvent(data as Stripe.Account);

        break;

      default:
        // Log unhandled event types
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }
  } catch (error) {
    // Handle errors during event processing
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error handling event: ${error}`,
    );
  }

  res.sendStatus(200); // Send success response
};

export default handleStripeWebhook;
