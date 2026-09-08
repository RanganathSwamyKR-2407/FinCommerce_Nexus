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
  return 1;
}

// GET /api/loans
router.get('/', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const user = await db.findUserById(userId);
    const loans = await db.getLoans(userId);

    res.json({
      creditLine: user?.creditLine,
      loans,
      benchmarkRates: {
        primeRate: '10.5% - 12.5% p.a.',
        processingFee: '0% special promotional waiver',
        foreclosureCharges: 'NIL after 3 EMIs',
        tenuresAvailableMonths: [3, 6, 9, 12, 18, 24],
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/loans:', error);
    res.status(500).json({ error: 'Failed to retrieve lending status.' });
  }
});

// POST /api/loans
// Cash-flow assessment & Explainable Lending Evaluation
router.post('/', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { income, existingEmi, requested, tenureMonths, purpose } = req.body;

    if (!income || Number(income) <= 0) {
      return res.status(400).json({ error: 'Please specify your verified net monthly income.' });
    }
    if (!requested || Number(requested) <= 0) {
      return res.status(400).json({ error: 'Please specify the loan amount requested.' });
    }

    const application = await db.applyLoan(userId, {
      monthlyIncome: Number(income),
      existingEmi: Number(existingEmi || 0),
      requestedAmount: Number(requested),
      tenureMonths: Number(tenureMonths || 12),
      purpose: purpose || 'General Purpose / Equipment',
    });

    const user = await db.findUserById(userId);

    res.status(201).json({
      ok: true,
      status: application.status,
      application,
      updatedCreditLine: user?.creditLine,
      message:
        application.status === 'approved'
          ? `Congratulations! Pre-approved for ₹${application.approvedLimit.toLocaleString('en-IN')} with instant credit line activation.`
          : 'Application received. Under cash-flow underwriting review.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/loans:', error);
    res.status(400).json({ error: error.message || 'Lending assessment failed.' });
  }
});

export default router;
