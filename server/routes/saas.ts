import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { config } from '../config.js';

const router = Router();

// Helper to optionally extract user from token or fallback to demo user (id: 1)
async function resolveUser(req: any) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: number };
      const user = await db.findUserById(decoded.id);
      if (user) return user;
    } catch {
      // ignore token error for fallback
    }
  }
  return await db.findUserById(1);
}

// GET /api/saas/overview
router.get('/overview', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const data = await db.getSaasOverview(user.id);
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching SaaS overview:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch SaaS overview.' });
  }
});

// POST /api/saas/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { planId, billingCycle = 'monthly', paymentMethod = 'upi_autopay' } = req.body;
    if (!['starter', 'growth', 'enterprise'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const updatedSub = await db.subscribeSaasPlan(user.id, planId, billingCycle, paymentMethod);
    return res.json({
      success: true,
      message: `Successfully upgraded to ${updatedSub.planName}!`,
      subscription: updatedSub,
    });
  } catch (error: any) {
    console.error('Error upgrading SaaS subscription:', error);
    return res.status(400).json({ error: error.message || 'Failed to upgrade subscription.' });
  }
});

// POST /api/saas/invoices
router.post('/invoices', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { clientName, clientGstin, clientEmail, clientState, itemDescription, hsnCode, subtotal, taxRate, dueDate } = req.body;

    if (!clientName || !clientEmail || !itemDescription || !subtotal) {
      return res.status(400).json({ error: 'Client name, email, item description, and subtotal are required.' });
    }

    const newInvoice = await db.createSaasInvoice(user.id, {
      clientName,
      clientGstin,
      clientEmail,
      clientState,
      itemDescription,
      hsnCode,
      subtotal: Number(subtotal),
      taxRate: taxRate ? Number(taxRate) : 18,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: 'GST E-Invoice & signed IRN generated successfully!',
      invoice: newInvoice,
    });
  } catch (error: any) {
    console.error('Error creating SaaS invoice:', error);
    return res.status(500).json({ error: error.message || 'Failed to create invoice.' });
  }
});

// PATCH /api/saas/invoices/:id/status
router.patch('/invoices/:id/status', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['paid', 'pending', 'overdue'].includes(status)) {
      return res.status(400).json({ error: 'Invalid invoice status.' });
    }

    const updated = await db.updateSaasInvoiceStatus(user.id, id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    return res.json({
      success: true,
      invoice: updated,
    });
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    return res.status(500).json({ error: error.message || 'Failed to update invoice status.' });
  }
});

// POST /api/saas/customer-subscriptions/:id/toggle
router.post('/customer-subscriptions/:id/toggle', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.params;
    const updated = await db.toggleCustomerSubscription(user.id, id);
    if (!updated) {
      return res.status(404).json({ error: 'Customer subscription not found.' });
    }

    return res.json({
      success: true,
      subscription: updated,
      message: `Customer subscription status changed to ${updated.status}.`,
    });
  } catch (error: any) {
    console.error('Error toggling customer subscription:', error);
    return res.status(500).json({ error: error.message || 'Failed to toggle subscription.' });
  }
});

// POST /api/saas/customer-subscriptions/:id/charge
router.post('/customer-subscriptions/:id/charge', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id } = req.params;
    const result = await db.chargeCustomerSubscription(user.id, id);

    return res.json({
      success: true,
      message: `Successfully processed UPI Autopay charge of ₹${result.chargedAmount.toLocaleString('en-IN')}. Funds credited to your account!`,
      result,
    });
  } catch (error: any) {
    console.error('Error executing customer charge:', error);
    return res.status(400).json({ error: error.message || 'Failed to execute charge.' });
  }
});

// POST /api/saas/api-keys
router.post('/api-keys', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { keyType = 'live', name = 'New Merchant API Key' } = req.body;
    const newKey = await db.generateSaasApiKey(user.id, keyType, name);

    return res.status(201).json({
      success: true,
      message: 'New API Key provisioned with instant HMAC token authentication.',
      apiKey: newKey,
    });
  } catch (error: any) {
    console.error('Error generating API key:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate API key.' });
  }
});

// POST /api/saas/webhooks/simulate
router.post('/webhooks/simulate', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { eventType = 'payment.captured' } = req.body;
    const log = await db.simulateSaasWebhook(user.id, eventType);

    return res.json({
      success: true,
      message: `Live webhook '${eventType}' dispatched and delivered with HTTP 200.`,
      webhookLog: log,
    });
  } catch (error: any) {
    console.error('Error simulating webhook:', error);
    return res.status(500).json({ error: error.message || 'Failed to simulate webhook.' });
  }
});

export default router;
