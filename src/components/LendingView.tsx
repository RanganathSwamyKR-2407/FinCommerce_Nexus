import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Percent,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { CreditLine, Loan } from '../types/index.js';
import { formatInr } from '../utils/format.js';

export const LendingView: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useCart();

  const [creditLine, setCreditLine] = useState<CreditLine | null>(user?.creditLine || null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Application form state
  const [monthlyIncome, setMonthlyIncome] = useState('85000');
  const [existingEmi, setExistingEmi] = useState('12000');
  const [requestedAmount, setRequestedAmount] = useState('50000');
  const [tenureMonths, setTenureMonths] = useState(12);
  const [purpose, setPurpose] = useState('Workspace Gear & Electronics');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationResult, setApplicationResult] = useState<any | null>(null);

  // EMI Calculator State
  const [calcAmount, setCalcAmount] = useState(60000);
  const [calcTenure, setCalcTenure] = useState(6);
  const annualInterestRate = 0.12; // 12% p.a.

  const calculateEmi = (principal: number, months: number, rate: number) => {
    const monthlyRate = rate / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const calculatedEmi = calculateEmi(calcAmount, calcTenure, annualInterestRate);
  const totalPayable = calculatedEmi * calcTenure;
  const totalInterest = totalPayable - calcAmount;

  useEffect(() => {
    fetchLoans();
  }, [token]);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/loans', { headers });
      if (res.ok) {
        const data = await res.json();
        setCreditLine(data.creditLine);
        setLoans(data.loans || []);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setApplicationResult(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/loans', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          income: parseFloat(monthlyIncome),
          existingEmi: parseFloat(existingEmi),
          requested: parseFloat(requestedAmount),
          tenureMonths,
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Underwriting evaluation declined');

      setApplicationResult(data);
      if (data.updatedCreditLine) setCreditLine(data.updatedCreditLine);
      await refreshUser();
      await fetchLoans();
      showToast(data.message || 'Credit line updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Application error', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const availableLimit = creditLine?.availableLimit ?? user?.availableCreditLimit ?? 124500;
  const totalLimit = creditLine?.totalLimit ?? user?.creditLimit ?? 150000;
  const usedLimit = totalLimit - availableLimit;
  const utilizationPercent = Math.min(100, Math.round((usedLimit / totalLimit) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Explainable Underwriting & Cash-Flow Financing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Pre-Approved Credit & Split-Pay Line
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Zero paperwork, real-time banking telemetry underwriting, and fair 0% interest Split-in-3 checkout credit.
        </p>
      </div>

      {/* Credit Line Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/20 flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1" /> Active Instant Credit Line
            </span>
            <span className="text-[11px] text-slate-400">Account: FC-CREDIT-9402</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-semibold uppercase">Available for Checkout</span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight">{formatInr(availableLimit)}</span>
            </div>
            <div className="text-sm text-slate-300 border-l border-slate-700 pl-4">
              <span className="text-xs text-slate-400 block font-semibold uppercase">Total Approved Line</span>
              <span className="font-bold text-lg text-white">{formatInr(totalLimit)}</span>
            </div>
          </div>

          {/* Utilization Progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
              <span>Credit Line Utilization: {utilizationPercent}%</span>
              <span>Used: {formatInr(usedLimit)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-indigo-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Explainable Underwriting Pillars */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Why You Were Approved
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-200">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Low Debt-to-Income ratio (DTI: 21% &lt; 40% cap)</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>14-week uninterrupted savings habit on UPI</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Healthy average monthly UPI receipts &gt; ₹70,000</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Grid: Interactive EMI Simulator & Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive EMI Calculator */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Interactive EMI Simulator
              </h2>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Benchmark 12% p.a.
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Purchase / Financing Amount</span>
                <span className="text-indigo-600 font-mono text-sm">{formatInr(calcAmount)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>₹5,000</span>
                <span>₹1,25,000</span>
                <span>₹2,50,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Tenure in Months</span>
                <span className="text-indigo-600 font-mono text-sm">{calcTenure} Months</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[3, 6, 9, 12, 18].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCalcTenure(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      calcTenure === m
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {m} M
                  </button>
                ))}
              </div>
            </div>

            {/* Results Callout */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600 font-semibold">Estimated Monthly EMI:</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {formatInr(calculatedEmi)} <span className="text-xs font-normal text-slate-500">/ mo</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Total Interest</span>
                  <span className="font-bold text-slate-800">{formatInr(totalInterest)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Total Amount Payable</span>
                  <span className="font-bold text-slate-800">{formatInr(totalPayable)}</span>
                </div>
              </div>
            </div>

            {/* Note on 0% Split in 3 */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Tip: When paying in 3 installments at checkout, interest is <strong>0% flat</strong> with no extra fees!
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Underwriting & Limit Boost Application */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Credit Limit Boost & Term Loan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit real-time cash flow verification for instant automatic limit enhancement.
            </p>
          </div>

          {applicationResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Underwriting Assessment Approved!</span>
              </div>
              <p className="text-emerald-900">{applicationResult.message}</p>
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Net Monthly In-Hand Income (₹) *
              </label>
              <input
                type="number"
                required
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Existing Monthly Loan EMIs (₹)
              </label>
              <input
                type="number"
                value={existingEmi}
                onChange={(e) => setExistingEmi(e.target.value)}
                placeholder="0"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Requested Credit Line Limit (₹) *
              </label>
              <input
                type="number"
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono font-bold focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Financing Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
              >
                <option value="Workspace Gear & Electronics">Workspace Gear & Electronics</option>
                <option value="Personal Travel & Education">Personal Travel & Education</option>
                <option value="Business Equipment">Business Equipment</option>
                <option value="Medical & Emergency Reserve">Medical & Emergency Reserve</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isApplying}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Banking Telemetry...</span>
                </>
              ) : (
                <>
                  <span>Evaluate Cash Flow & Upgrade Limit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Active Borrowings / Loans Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Active Credit Accounts & Loans
            </h2>
            <p className="text-xs text-slate-500">Live drawdowns and scheduled monthly repayments</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {loans.length} active
          </span>
        </div>

        {loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Loan Account</th>
                  <th className="px-6 py-3">Principal</th>
                  <th className="px-6 py-3">Tenure</th>
                  <th className="px-6 py-3">Monthly EMI</th>
                  <th className="px-6 py-3">Remaining Balance</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{l.loanNumber || `LOAN-${l.id}`}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatInr(l.principal)}</td>
                    <td className="px-6 py-4">{l.tenureMonths} Months</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{formatInr(l.monthlyEmi)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatInr(l.remainingBalance)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No active term loans. Your available credit line of {formatInr(availableLimit)} is ready for 0% split checkout.
          </div>
        )}
      </div>
    </div>
  );
};
