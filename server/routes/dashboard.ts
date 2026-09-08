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
      // ignore token verification error for fallback
    }
  }
  return await db.findUserById(1);
}

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const { passwordHash: _, ...safeUser } = user;

    // Fetch related records in parallel
    const [transactions, mandates, loans, investments, productsResult] = await Promise.all([
      db.getTransactions(user.id),
      db.getMandates(user.id),
      db.getLoans(user.id),
      db.getInvestments(user.id),
      db.getAllProducts({ inStock: true, sort: 'featured' }),
    ]);

    // Calculate aggregated portfolio value
    const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0) + (user.digitalGoldValueInr || 0);
    const totalCurrentValue = investments.reduce((sum, i) => sum + i.currentValue, 0) + (user.digitalGoldValueInr || 0);
    const totalMonthlyMandates = mandates.reduce((sum, m) => sum + (m.status === 'active' ? m.amount : 0), 0);

    // Contextual AI Financial Tip
    const upcomingMandatesCount = mandates.filter(m => m.status === 'active').length;
    const disposableBuffer = user.bankAccount.balance - totalMonthlyMandates;
    const aiInsight = disposableBuffer > 5000
      ? `You can safely move ₹${Math.round(disposableBuffer * 0.35).toLocaleString('en-IN')} to high-yield Digital Gold or Nifty Index SIP after accounting for ₹${totalMonthlyMandates.toLocaleString('en-IN')} in upcoming AutoPay mandates.`
      : `Upcoming AutoPay commitments total ₹${totalMonthlyMandates.toLocaleString('en-IN')}. Maintain at least ₹${(totalMonthlyMandates + 2000).toLocaleString('en-IN')} in your HDFC account to avoid mandate bounce charges.`;

    res.json({
      user: safeUser,
      balances: {
        upiBankBalance: user.bankAccount.balance,
        bankName: user.bankAccount.bankName,
        accountNumber: user.bankAccount.accountNumber,
        upiId: user.bankAccount.upiId,
        creditLineTotal: user.creditLine.totalLimit,
        creditLineAvailable: user.creditLine.availableLimit,
        creditLineUsed: user.creditLine.usedLimit,
        creditLineApr: user.creditLine.interestRateApr,
        digitalGoldGrams: user.digitalGoldGrams,
        digitalGoldValueInr: user.digitalGoldValueInr,
        totalInvested,
        totalCurrentValue,
        monthlyMandateTotal: totalMonthlyMandates,
      },
      financialHealth: user.financialHealth,
      recentTransactions: transactions.slice(0, 8),
      mandates,
      loans,
      investments,
      featuredProducts: productsResult.products.slice(0, 4),
      aiIntelligence: {
        headline: 'Financial Health & Flow Summary',
        insight: aiInsight,
        savingsRate: `${user.financialHealth.monthlySavingsRate}%`,
        streakWeeks: user.financialHealth.savingsStreakWeeks,
        resilienceScore: user.financialHealth.score,
        rating: user.financialHealth.rating,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/dashboard:', error);
    res.status(500).json({ error: 'Failed to generate FinCommerce dashboard view.' });
  }
});

export default router;
