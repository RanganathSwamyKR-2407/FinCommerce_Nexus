import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'nexus_ecommerce_jwt_super_secret_key_2026',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexus_commerce',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Lazy Stripe initialization to prevent crashes when STRIPE_SECRET_KEY is absent
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!config.stripeSecretKey) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}
