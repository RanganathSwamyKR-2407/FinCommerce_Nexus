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

// Available curated investment funds / baskets
const availableFunds = [
  {
    id: 'nifty_index',
    name: 'FinCommerce Nifty 50 Index Fund',
    category: 'Large Cap Index',
    riskLevel: 'Low',
    cagr3Year: 15.8,
    cagr5Year: 14.2,
    expenseRatio: 0.15,
    minSip: 500,
    minLumpsum: 1000,
    description: 'Tracks India’s top 50 blue-chip market leaders with near-zero tracking error and ultra-low expense ratio.',
  },
  {
    id: 'digital_gold',
    name: '24K 99.9% Pure Digital Gold (MMTC-PAMP)',
    category: 'Precious Metals',
    riskLevel: 'Low',
    cagr3Year: 16.4,
    cagr5Year: 13.8,
    currentPricePerGram: 7200,
    minSip: 100,
    minLumpsum: 100,
    description: 'Vault-secured, fully insured 99.9% pure 24 Karat gold. Liquidate to bank account or order physical delivery anytime.',
  },
  {
    id: 'green_energy',
    name: 'Bharat Green Energy & Clean Tech Basket',
    category: 'Thematic Equities',
    riskLevel: 'Moderate',
    cagr3Year: 21.4,
    cagr5Year: 18.5,
    expenseRatio: 0.45,
    minSip: 1000,
    minLumpsum: 2500,
    description: 'Curated basket of India’s solar champions, EV ecosystem pioneers, and grid infrastructure leaders.',
  },
  {
    id: 'liquid_debt',
    name: 'Sovereign Green & Liquid Debt Reserve',
    category: 'High-Yield Liquid Cash',
    riskLevel: 'Low',
    cagr3Year: 7.6,
    cagr5Year: 7.2,
    expenseRatio: 0.12,
    minSip: 500,
    minLumpsum: 500,
    description: 'Ultra-safe alternative to bank savings accounts. Instant T+0 withdrawal up to ₹50,000 per day directly to UPI.',
  },
];

// GET /api/investments
router.get('/', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const user = await db.findUserById(userId);
    const userInvestments = await db.getInvestments(userId);

    const totalInvested = userInvestments.reduce((sum, i) => sum + i.investedAmount, 0) + (user?.digitalGoldValueInr || 0);
    const totalCurrentValue = userInvestments.reduce((sum, i) => sum + i.currentValue, 0) + (user?.digitalGoldValueInr || 0);
    const totalGains = totalCurrentValue - totalInvested;
    const overallReturnPct = totalInvested > 0 ? Number(((totalGains / totalInvested) * 100).toFixed(2)) : 0;

    res.json({
      portfolio: {
        totalInvested,
        totalCurrentValue,
        totalGains,
        overallReturnPct,
        digitalGoldGrams: user?.digitalGoldGrams || 0,
        digitalGoldValue: user?.digitalGoldValueInr || 0,
      },
      holdings: userInvestments,
      availableFunds,
    });
  } catch (error: any) {
    console.error('Error in GET /api/investments:', error);
    res.status(500).json({ error: 'Failed to retrieve investment portfolio.' });
  }
});

// POST /api/investments
// Execute SIP or Lumpsum buy
router.post('/', async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { fundId, amount, isSip, frequency } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid investment amount.' });
    }

    const fund = availableFunds.find(f => f.id === fundId) || availableFunds[0];
    const numAmount = Number(amount);

    const investment = await db.createInvestment(userId, {
      fundName: fund.name,
      fundType: fund.id as any,
      amount: numAmount,
      isSip: Boolean(isSip),
      frequency: frequency || 'monthly',
    });

    const user = await db.findUserById(userId);

    res.status(201).json({
      ok: true,
      message: isSip
        ? `Systematic Investment Plan (SIP) of ₹${numAmount.toLocaleString('en-IN')}/${frequency || 'month'} in ${fund.name} started successfully.`
        : `Investment of ₹${numAmount.toLocaleString('en-IN')} in ${fund.name} executed. Units allocated.`,
      investment,
      updatedBalance: user?.bankAccount.balance,
    });
  } catch (error: any) {
    console.error('Error in POST /api/investments:', error);
    res.status(400).json({ error: error.message || 'Investment failed.' });
  }
});

export default router;
