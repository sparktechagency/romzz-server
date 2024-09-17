import { Request, Response } from 'express';
import config from '../config';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import handleSubscriptionCreated from '../handlers/handleSubscriptionCreated';
import handleSubscriptionUpdated from '../handlers/handleSubscriptionUpdated';
import handleSubscriptionDeleted from '../handlers/handleSubscriptionDeleted';
import logger from '../logger/winston.logger';
import colors from 'colors';

const handleStripeWebhook = async (req: Request, res: Response) => {
  // Extract the Stripe signature from the request header
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripeWebhookSecret as string;

  let event: Stripe.Event | undefined;

  // Verify the authenticity of the event by checking its signature
  try {
    // Stripe expects the raw request body for verification, so avoid parsing it
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    // If the signature verification fails, return a descriptive error
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed. ${error}`,
    );
  }

  // If the event is invalid, return a bad request error
  if (!event) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid event received!');
  }

  // Extract relevant data from the event
  const data = event.data.object as
    | Stripe.Checkout.Session
    | Stripe.Subscription;
  const eventType = event.type;

  // Handle different types of events based on the eventType
  try {
    switch (eventType) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data);
        break;

      // case 'customer.subscription.updated':
      //   await handleSubscriptionUpdated(data);
      //   break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(data);
        break;

      default:
        // Unhandled event type
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error handling event: ${error}`,
    );
  }

  res.sendStatus(200); // Acknowledge receipt of the event
};

export default handleStripeWebhook;
