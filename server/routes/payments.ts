import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { config } from '../config.js';

const router = Router();

async function resolveUserId(req: any): Promise<number> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: number };
      return decoded.id;
    } catch {
      // fallback
    }
  }
  return 1; // Default demo user
}

// POST /api/payments
// Transfer to UPI ID, Mobile Number, or QR Code
router.post('/', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { recipient, recipientUpiOrAccount, amount, paymentMethod, category, note } = req.body;

    if (!recipient || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please specify a recipient and a valid payment amount.' });
    }

    const numAmount = Number(amount);
    const method = paymentMethod === 'Credit Line' ? 'Credit Line' : paymentMethod === 'QR Code' ? 'QR Code' : 'UPI';

    const transaction = await db.processPayment({
      userId,
      recipient: recipient.trim(),
      recipientUpiOrAccount: recipientUpiOrAccount?.trim(),
      amount: numAmount,
      paymentMethod: method,
      category: category || 'Transfers',
      note: note || (numAmount < 500 ? 'UPI Lite Instant Transfer' : 'FinCommerce UPI Payment'),
    });

    const user = await db.findUserById(userId);

    res.status(201).json({
      ok: true,
      status: 'success',
      message: `Payment of ₹${numAmount.toLocaleString('en-IN')} to ${recipient} completed successfully.`,
      reference: transaction.referenceId,
      transaction,
      updatedBalance: {
        upiBankBalance: user?.bankAccount.balance,
        creditLineAvailable: user?.creditLine.availableLimit,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/payments:', error);
    res.status(400).json({ error: error.message || 'Payment processing failed.' });
  }
});

// GET /api/payments/history
router.get('/history', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const transactions = await db.getTransactions(userId);
    res.json({ transactions });
  } catch (error: any) {
    console.error('Error in GET /api/payments/history:', error);
    res.status(500).json({ error: 'Failed to retrieve transaction history.' });
  }
});

// POST /api/payments/qr-generate
router.post('/qr-generate', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const user = await db.findUserById(userId);
    const { amount, note } = req.body;

    const payeeVpa = user?.upiId || 'priya.sharma@okhdfcbank';
    const payeeName = encodeURIComponent(user?.name || 'Priya Sharma');
    const numAmount = amount ? Number(amount) : undefined;
    const txnNote = encodeURIComponent(note || 'Payment via FinCommerce');

    let upiString = `upi://pay?pa=${payeeVpa}&pn=${payeeName}&cu=INR&tn=${txnNote}`;
    if (numAmount) {
      upiString += `&am=${numAmount.toFixed(2)}`;
    }

    res.json({
      ok: true,
      upiString,
      payeeVpa,
      payeeName: user?.name || 'Priya Sharma',
      amount: numAmount,
      note: note || 'Payment via FinCommerce',
    });
  } catch (error: any) {
    console.error('Error in POST /api/payments/qr-generate:', error);
    res.status(500).json({ error: 'Failed to generate QR payment string.' });
  }
});

// POST /api/payments/collect
router.post('/collect', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const user = await db.findUserById(userId);
    const { payerUpiOrPhone, amount, note } = req.body;

    if (!payerUpiOrPhone || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please provide a valid payer UPI ID or mobile number and amount.' });
    }

    const collectRef = 'FC-REQ-' + Math.floor(100000 + Math.random() * 900000);

    res.json({
      ok: true,
      status: 'request_sent',
      collectRef,
      message: `Collect request of ₹${Number(amount).toLocaleString('en-IN')} sent to ${payerUpiOrPhone}. Notification dispatched to user's UPI app.`,
      requestDetails: {
        from: user?.name,
        fromUpi: user?.upiId,
        to: payerUpiOrPhone,
        amount: Number(amount),
        note: note || 'Payment requested via FinCommerce',
        expiresInMinutes: 15,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/payments/collect:', error);
    res.status(500).json({ error: 'Failed to create payment collect request.' });
  }
});

// GET /api/payments/mandates
router.get('/mandates', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const mandates = await db.getMandates(userId);
    res.json({ mandates });
  } catch (error: any) {
    console.error('Error in GET /api/payments/mandates:', error);
    res.status(500).json({ error: 'Failed to retrieve AutoPay mandates.' });
  }
});

// POST /api/payments/mandates
router.post('/mandates', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { name, category, amount, maxLimit, frequency, upiId } = req.body;

    if (!name || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter mandate name and amount.' });
    }

    const newMandate = await db.createMandate(userId, {
      name: name.trim(),
      category: category || 'Utilities',
      amount: Number(amount),
      maxLimit: maxLimit ? Number(maxLimit) : Number(amount) * 1.5,
      frequency: frequency || 'monthly',
      upiId: upiId || 'autopay@fincommerce',
    });

    res.status(201).json({
      ok: true,
      message: `AutoPay Mandate for "${name}" registered with NPCI and linked to your UPI account.`,
      mandate: newMandate,
    });
  } catch (error: any) {
    console.error('Error in POST /api/payments/mandates:', error);
    res.status(500).json({ error: 'Failed to set up AutoPay mandate.' });
  }
});

export default router;
