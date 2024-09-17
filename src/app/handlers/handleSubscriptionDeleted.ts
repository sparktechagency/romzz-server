import Stripe from 'stripe';
import stripe from '../config/stripe';
import { Subscription } from '../modules/Subscription/subscription.model';
import { User } from '../modules/User/user.model';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

const handleSubscriptionDeleted = async (
  data: Stripe.Subscription | Stripe.Checkout.Session,
) => {
  // Retrieve the subscription object from Stripe using the subscription ID
  const subscription = await stripe.subscriptions.retrieve(data.id);

  // Find the subscription record in the database by customerId
  const userSubscription = await Subscription.findOne({
    customerId: subscription.customer,
    status: 'active',
  });

  if (userSubscription) {
    // Update the subscription status to 'deactivated'
    await Subscription.findByIdAndUpdate(
      userSubscription._id, // Use the _id from the found subscription
      { status: 'deactivated' }, // Update the subscription status
      { new: true }, // Return the updated document
    );

    // Find the user associated with the subscription
    const existingUser = await User.findById(userSubscription?.userId);

    if (existingUser) {
      // If no other active subscriptions, disable access
      await User.findByIdAndUpdate(
        existingUser._id,
        {
          hasAccess: false,
        },
        { new: true },
      );
    } else {
      // If the user is not found, return a descriptive error
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `User with ID: ${userSubscription.userId} not found.`,
      );
    }
  } else {
    // If the subscription is not found, return a not found error
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Subscription with Customer ID: ${subscription.customer} not found.`,
    );
  }
};

export default handleSubscriptionDeleted;
