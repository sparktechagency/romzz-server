import { Request, Response } from 'express';
import config from '../../config';
import stripe from '../../config/stripe';
import Stripe from 'stripe';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { User } from '../User/user.model';
import { Subscription } from './subscription.model';
import { PricingPlan } from '../PricingPlan/pricingPlan.model';
import logger from '../../logger/winston.logger';
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
      case 'checkout.session.completed': {
        // When a checkout session is completed, handle subscription creation
        const session = await stripe.checkout.sessions.retrieve(data?.id, {
          expand: ['line_items'],
        });

        // Retrieve the customer object associated with the session
        const customer = (await stripe.customers.retrieve(
          session.customer as string,
        )) as Stripe.Customer;

        // Extract line items from the session to get the associated price ID
        const lineItems = session.line_items?.data ?? [];
        const priceId = lineItems[0]?.price?.id;

        // If a valid customer email exists, proceed to check the user and pricing plan
        if (customer?.email) {
          // Check if a user with the given email exists
          const existingUser = await User.findOne({ email: customer?.email });

          if (existingUser) {
            // Find the pricing plan associated with the priceId
            const pricingPlan = await PricingPlan.findOne({ priceId });

            if (pricingPlan) {
              // Create a new subscription record in the database
              const newSubscription = new Subscription({
                userId: existingUser?._id,
                customerId: customer?.id,
                packageId: pricingPlan?._id,
                priceId,
              });

              await newSubscription.save();

              // Update the user to reflect an active subscription and access
              await User.findByIdAndUpdate(
                existingUser?._id, // Find the user by their ID
                {
                  isSubscribed: true, // Update the isSubscribed field
                  hasAccess: true, // Update the hasAccess field
                },
                { new: true }, // Return the updated document
              );
            } else {
              // If the pricing plan is not found, return a not found error
              throw new ApiError(
                httpStatus.NOT_FOUND,
                `Pricing plan with Price ID: ${priceId} not found!`,
              );
            }
          } else {
            // If the user is not found, return a descriptive error
            throw new ApiError(
              httpStatus.NOT_FOUND,
              `User with Email: ${customer.email} not found!`,
            );
          }
        } else {
          // If no email is associated with the customer, return a bad request error
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'No email found for the customer!',
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Handle subscription deletion (e.g., cancellation or failed payment)
        const subscription = await stripe.subscriptions.retrieve(data?.id);

        // Find the subscription record in the database based on the customer ID
        const userSubscription = await Subscription.findOne({
          customerId: subscription.customer as string,
        });

        if (userSubscription) {
          // Find the user associated with the subscription
          const existingUser = await User.findById(userSubscription.userId);

          if (existingUser) {
            // Disable access for the user by updating the relevant fields
            await User.findByIdAndUpdate(
              existingUser?._id, // Find the user by their ID
              {
                isSubscribed: false, // Update the isSubscribed field
                hasAccess: false, // Update the hasAccess field
              },
              { new: true }, // Return the updated document
            );
          } else {
            // If the user is not found, return a descriptive error
            throw new ApiError(
              httpStatus.NOT_FOUND,
              `User with ID: ${userSubscription?.userId} not found.`,
            );
          }
        } else {
          // If the subscription is not found, return a not found error
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Subscription with Customer ID: ${subscription?.customer} not found.`,
          );
        }

        break;
      }

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

export { handleStripeWebhook };
