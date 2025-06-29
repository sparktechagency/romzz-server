import stripe from "../config/stripe";
import config from "../config";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";

interface Payload {
    duration: '1 month' | '3 months' | '6 months' | '1 year';
    price: number;
}

export const updateStripeProductCatalog = async ( productId: string, payload: Payload ): Promise<string> => {
    
    let interval: 'month' | 'year' = 'month'; 
    let intervalCount = 1;

    // 1️⃣ Retrieve the existing active price for the product
    const existingPrices = await stripe.prices.list({ product: productId, active: true });  

    console.log(existingPrices)

    if (existingPrices.data.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No active price found for this product in Stripe.");
    }

    // map duration to interval_count
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
            intervalCount = 1;
    }

    // Create a new price for the existing product
    const price = await stripe.prices.create({
        product: productId,
        unit_amount: payload.price && payload.price * 100,
        currency: 'usd',
        recurring: { interval, interval_count: intervalCount },
    });

    // if failed to create new price
    if (!price) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create new price in Stripe");
    }

    /* // retrieved current prices;
    const oldPrices = await stripe.prices.list({ product: productId, active: true });

    // deactivate current prices
    for (const price of oldPrices.data) {
        await stripe.prices.update(price.id, { active: false });
    } */

    // Create a new payment link
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
                url: `${config.stripeSuccessURL}`,
            },
        },
        metadata: {
            productId: productId,
        },
    });

    // if failed to create payment link
    if (!paymentLink.url) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create new payment link");
    }

    return paymentLink.url;
};