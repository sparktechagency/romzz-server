import stripe from "../config/stripe";
import config from "../config";
import { IPricingPlan } from "../modules/PricingPlan/pricingPlan.interface";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";

export const createStripeProductCatalog = async ( payload: Partial<IPricingPlan>): Promise<{ productId: string; paymentLink: string } | null> => {

    // Create Product in Stripe
    const product = await stripe.products.create({
        name: payload.title as string,
        description: "This is a subscription package",
    });

    let interval: 'month' | 'year' = 'month'; // Default to 'month'
    let intervalCount = 1; // Default to every 1 month

    // Map duration to interval_count
    switch (payload.duration) {
        case '1 month':
            interval = 'month';
            intervalCount = 1;
            break;
        case '3 months':
            interval = 'month';
            intervalCount = 3;
            break;
        case '6 months':
            interval = 'month';
            intervalCount = 6;
            break;
        case '1 year':
            interval = 'year';
            intervalCount = 1;
            break;
        default:
            interval = 'month';
            intervalCount = 1; // Defaults to 1 month if duration is not specified
    }


    // Create Price for the Product
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Number(payload.price) * 100, // in cents
        currency: 'usd', // or your chosen currency
        recurring: { interval, interval_count: intervalCount },
    });

    if (!price) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create price in Stripe");
    }

    // Create a Payment Link
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        after_completion: {
            type: 'redirect',
            redirect: {
                url: `${config.stripeSuccessURL}`, // Redirect URL on successful payment
            },
        },
        metadata: {
            productId: product.id,
        },
    });

    if (!paymentLink.url) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create payment link");
    }

    return { productId: product.id, paymentLink: paymentLink.url };
};
