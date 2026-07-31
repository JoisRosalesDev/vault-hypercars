import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is missing from environment variables. Using placeholder for build.");
}

export const stripe = new Stripe(apiKey, {
  apiVersion: "2023-10-16" as unknown as Stripe.LatestApiVersion,
  typescript: true,
});
