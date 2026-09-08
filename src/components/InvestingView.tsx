import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Repeat,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { Investment } from '../types/index.js';
import { formatInr } from '../utils/format.js';

interface FundOption {
  id: string;
  name: string;
  category: string;
  riskLevel: string;
  cagr3Year: number;
  cagr5Year: number;
  expenseRatio?: number;
  currentPricePerGram?: number;
  minSip: number;
  minLumpsum: number;
  description: string;
}

export const InvestingView: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useCart();

  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [holdings, setHoldings] = useState<Investment[]>([]);
  const [availableFunds, setAvailableFunds] = useState<FundOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Investment Modal / Form State
  const [selectedFund, setSelectedFund] = useState<FundOption | null>(null);
  const [investAmount, setInvestAmount] = useState('2000');
  const [isSip, setIsSip] = useState(true);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipYears, setSipYears] = useState(5);
  const [sipReturnRate, setSipReturnRate] = useState(14); // 14% p.a.

  const calculateSipWealth = (monthly: number, years: number, annualRatePct: number) => {
    const months = years * 12;
    const r = annualRatePct / 12 / 100;
    const maturity = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const invested = monthly * months;
    const wealthGain = maturity - invested;
    return {
      invested: Math.round(invested),
      maturity: Math.round(maturity),
      wealthGain: Math.round(wealthGain),
    };
  };

  const sipResult = calculateSipWealth(sipMonthly, sipYears, sipReturnRate);

  useEffect(() => {
    fetchInvestments();
  }, [token]);

  const fetchInvestments = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/investments', { headers });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data.portfolio);
        setHoldings(data.holdings || []);
        setAvailableFunds(data.availableFunds || []);
        if (data.availableFunds?.length > 0 && !selectedFund) {
          setSelectedFund(data.availableFunds[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund) return;
    const amountNum = parseFloat(investAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid investment amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/investments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fundId: selectedFund.id,
          amount: amountNum,
          isSip,
          frequency,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Investment execution declined');

      showToast(data.message || 'Investment successful!', 'success');
      await refreshUser();
      await fetchInvestments();
    } catch (err: any) {
      showToast(err.message || 'Investment failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goldGrams = portfolio?.digitalGoldGrams ?? user?.digitalGoldGrams ?? 4.8;
  const goldVal = goldGrams * 7275;
  const totalVal = (portfolio?.totalCurrentValue || 0) + goldVal;
  const totalInv = (portfolio?.totalInvested || 0) + (goldGrams * 6800);
  const totalGains = totalVal - totalInv;
  const gainPct = totalInv > 0 ? ((totalGains / totalInv) * 100).toFixed(1) : '15.4';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Goal-Based Wealth & Digital Gold</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Investments, SIPs & 24K Gold Vault
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Automate micro-investing, round up commerce transactions into pure gold, and compound wealth disciplined by design.
        </p>
      </div>

      {/* Portfolio Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-slate-400 block font-semibold uppercase">Total Portfolio Value</span>
          <span className="text-3xl font-black tracking-tight">{formatInr(totalVal)}</span>
          <div className="flex items-center text-xs text-emerald-400 font-bold mt-1">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            <span>+{gainPct}% all-time return</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block font-semibold uppercase">Total Capital Invested</span>
          <span className="text-xl font-bold text-slate-200">{formatInr(totalInv)}</span>
          <p className="text-[11px] text-slate-400 mt-1">Disciplined automated DCA</p>
        </div>

        <div>
          <span className="text-xs text-slate-400 block font-semibold uppercase">Net Unrealized Gains</span>
          <span className="text-xl font-bold text-emerald-400">+{formatInr(totalGains)}</span>
          <p className="text-[11px] text-slate-400 mt-1">Compound growth advantage</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-300 font-bold uppercase block">24K Digital Gold</span>
            <span className="text-xl font-black text-white">{goldGrams}g</span>
            <span className="text-[11px] text-slate-300 block">{formatInr(goldVal)}</span>
          </div>
          <Coins className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* Interactive SIP Compound Wealth Planner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Goal SIP Compound Return Simulator
            </h2>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            The Power of Compounding
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Monthly Investment Amount</span>
                <span className="text-indigo-600 font-mono text-sm">{formatInr(sipMonthly)} / mo</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={sipMonthly}
                onChange={(e) => setSipMonthly(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>₹500</span>
                <span>₹25,000</span>
                <span>₹50,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Investment Horizon</span>
                <span className="text-indigo-600 font-mono text-sm">{sipYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={sipYears}
                onChange={(e) => setSipYears(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>1 Year</span>
                <span>10 Years</span>
                <span>25 Years</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Expected Annual Return (CAGR)</span>
                <span className="text-indigo-600 font-mono text-sm">{sipReturnRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="0.5"
                value={sipReturnRate}
                onChange={(e) => setSipReturnRate(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>6% (Liquid/FD)</span>
                <span>14% (Index/Gold)</span>
                <span>24% (High Growth)</span>
              </div>
            </div>
          </div>

          {/* SIP Projected Wealth Callout */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase block">
                Projected Wealth in {sipYears} Years
              </span>
              <span className="text-3xl font-black text-indigo-900 tracking-tight font-mono">
                {formatInr(sipResult.maturity)}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Your Total Contribution:</span>
                <span className="font-bold text-slate-900">{formatInr(sipResult.invested)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Wealth Gain (Profit):</span>
                <span>+{formatInr(sipResult.wealthGain)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setInvestAmount(sipMonthly.toString());
                setIsSip(true);
                showToast(`Configured SIP of ${formatInr(sipMonthly)} in investment form.`, 'info');
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1"
            >
              <span>Setup This SIP Now</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Curated Funds & One-Click Invest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Curated Funds List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Curated Wealth Baskets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableFunds.map((fund) => (
              <div
                key={fund.id}
                onClick={() => setSelectedFund(fund)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFund?.id === fund.id
                    ? 'border-indigo-600 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {fund.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      fund.riskLevel === 'Low'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {fund.riskLevel} Risk
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{fund.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {fund.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">3Y CAGR</span>
                    <span className="font-black text-emerald-700">+{fund.cagr3Year}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Min. SIP</span>
                    <span className="font-bold text-slate-900">{formatInr(fund.minSip)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Execution Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Execute Investment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Selected: <strong className="text-slate-800">{selectedFund?.name || 'Nifty 50 Index Fund'}</strong>
            </p>
          </div>

          <form onSubmit={handleExecuteInvestment} className="space-y-4">
            {/* Toggle SIP vs One-Time */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setIsSip(true)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  isSip ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly SIP
              </button>
              <button
                type="button"
                onClick={() => setIsSip(false)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  !isSip ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One-Time Lumpsum
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Investment Amount (₹) *
              </label>
              <input
                type="number"
                step="50"
                min="100"
                required
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono font-bold focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
              />
            </div>

            {isSip && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  SIP Debit Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                >
                  <option value="monthly">Monthly AutoPay on 5th</option>
                  <option value="weekly">Weekly Every Monday</option>
                </select>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-900 block">Deduction Method</span>
              <span>Debited instantly from linked HDFC Bank UPI (5401)</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Investment Units...</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 text-amber-300" />
                  <span>{isSip ? 'Start Automated SIP' : 'Invest Lumpsum Now'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Current Investment Holdings
            </h2>
            <p className="text-xs text-slate-500">Live portfolio valuation and accumulated units</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {holdings.length + 1} positions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Asset / Fund</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Invested Capital</th>
                <th className="px-6 py-3">Current Value</th>
                <th className="px-6 py-3 text-right">Returns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Digital Gold row */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>24K 99.9% Digital Gold Vault ({goldGrams}g)</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Round-Ups + Vault
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatInr(goldGrams * 6800)}</td>
                <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatInr(goldVal)}</td>
                <td className="px-6 py-4 text-right font-black text-emerald-700">+7.0%</td>
              </tr>

              {holdings.map((h) => {
                const gain = h.currentValue - h.investedAmount;
                const pct = h.investedAmount > 0 ? ((gain / h.investedAmount) * 100).toFixed(1) : '0';
                return (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{h.fundName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {h.isSip ? 'Monthly SIP' : 'Lumpsum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatInr(h.investedAmount)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatInr(h.currentValue)}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-700">+{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
