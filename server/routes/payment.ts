import { Router } from 'express';
import { config, getStripe } from '../config.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/payment/config
router.get('/config', (_req, res) => {
  res.json({
    publishableKey: config.stripePublishableKey,
    hasSecretKey: !!config.stripeSecretKey,
    isConfigured: !!(config.stripeSecretKey && config.stripePublishableKey),
    currency: 'USD',
  });
});

// POST /api/payment/create-payment-intent
router.post('/create-payment-intent', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, currency = 'usd', metadata } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    const stripe = getStripe();

    if (stripe) {
      // Real Stripe integration when STRIPE_SECRET_KEY is configured
      const amountInCents = Math.round(amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: req.user?.id?.toString() || 'guest',
          userEmail: req.user?.email || 'guest',
          ...metadata,
        },
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        mode: 'stripe',
        amount: amount,
      });
    }

    // High-fidelity sandbox demo mode when STRIPE_SECRET_KEY is not yet populated
    const mockIntentId = `pi_demo_${Date.now()}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

    res.json({
      clientSecret: mockClientSecret,
      paymentIntentId: mockIntentId,
      mode: 'demo',
      amount: amount,
      message: 'Demo payment simulated. Provide STRIPE_SECRET_KEY in Settings to enable real Stripe payments.',
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message || 'Payment processing initialization failed.' });
  }
});

export default router;
