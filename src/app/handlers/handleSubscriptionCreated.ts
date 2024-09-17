import Stripe from 'stripe';
import stripe from '../config/stripe';
import { User } from '../modules/User/user.model';
import { PricingPlan } from '../modules/PricingPlan/pricingPlan.model';
import { Subscription } from '../modules/Subscription/subscription.model';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

const handleSubscriptionCreated = async (
  data: Stripe.Subscription | Stripe.Checkout.Session,
) => {
  // Retrieve the subscription object from Stripe using the subscription ID
  const subscription = await stripe.subscriptions.retrieve(data.id);

  // Retrieve the customer associated with the subscription
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string,
  )) as Stripe.Customer;

  // Extract the price ID from the subscription items
  const priceId = subscription.items.data[0]?.price?.id;

  // Retrieve the invoice associated with the subscription to get the transaction ID
  const invoice = subscription.latest_invoice
    ? await stripe.invoices.retrieve(subscription.latest_invoice as string)
    : null;

  const trxId = invoice?.payment_intent;

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
          status: 'active',
          priceId,
          trxId,
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
};

export default handleSubscriptionCreated;
