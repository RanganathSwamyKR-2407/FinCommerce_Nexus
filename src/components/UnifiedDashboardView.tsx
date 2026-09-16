import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Coins,
  ChevronRight,
  MessageSquare,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DashboardData } from '../types/index.js';
import { formatInr } from '../utils/format.js';

interface UnifiedDashboardViewProps {
  onNavigate: (view: 'catalog' | 'payments' | 'lending' | 'investing' | 'orders' | 'saas') => void;
  onOpenAiAdvisor: () => void;
}

export const UnifiedDashboardView: React.FC<UnifiedDashboardViewProps> = ({
  onNavigate,
  onOpenAiAdvisor,
}) => {
  const { user, token, refreshUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/dashboard', { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    await fetchDashboard();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-28 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  const bankBalance = data?.user?.bankBalance ?? user?.bankBalance ?? 48500;
  const creditLimit = data?.user?.creditLimit ?? user?.creditLimit ?? 150000;
  const availableCredit = data?.user?.availableCreditLimit ?? user?.availableCreditLimit ?? 124500;
  const digitalGoldGrams = data?.user?.digitalGoldGrams ?? user?.digitalGoldGrams ?? 4.8;
  const goldValue = digitalGoldGrams * 7275;
  const healthScore = data?.user?.financialHealthScore ?? user?.financialHealthScore ?? 84;
  const streakWeeks = data?.user?.savingsStreakWeeks ?? user?.savingsStreakWeeks ?? 14;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Greeting & Quick Sync */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-400/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unified India Financial Protocol Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
              Namaste, {user?.name || 'Priya'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Your consolidated financial operating hub: monitor UPI cash-flow, leverage pre-approved split credit, and grow your wealth seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAiAdvisor}
              id="dashboard-open-ai-btn"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Ask AI Advisor</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh financial data"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center border border-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Pillars Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. UPI Bank Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">UPI Savings Account</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatInr(bankBalance)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span className="text-emerald-600 font-bold mr-1">● Active</span>
              VPA: {user?.upiId || 'priya@oksbi'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <span>Transfer / Pay</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
            <span className="text-[10px] text-slate-400 font-mono">HDFC Bank</span>
          </div>
        </div>

        {/* 2. Pre-Approved Credit Line */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Credit Line (Split-in-3)</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatInr(availableCredit)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Limit: {formatInr(creditLimit)} (0% Interest)
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('lending')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <span>Manage & Boost</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              Instant
            </span>
          </div>
        </div>

        {/* 3. 24K Digital Gold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">24K 99.9% Digital Gold</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatInr(goldValue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Vault Holding: <strong className="text-slate-800">{digitalGoldGrams} grams</strong>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('investing')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <span>Buy / Sell</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
            <span className="text-[10px] text-amber-600 font-bold">₹7,275/g</span>
          </div>
        </div>

        {/* 4. Financial Health Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Health Resilience Score</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900">{healthScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full ml-auto">
                Excellent
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              🔥 <strong className="text-slate-800">{streakWeeks} weeks</strong> disciplined savings streak
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onOpenAiAdvisor}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center"
            >
              <span>View Diagnostics</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
            <span className="text-[10px] text-slate-500">DTI: 21%</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('payments')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scan & Pay UPI</span>
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Shop Split-Pay Hardware</span>
          </button>
          <button
            onClick={() => onNavigate('lending')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span>Instant Credit Assessment</span>
          </button>
          <button
            onClick={() => onNavigate('investing')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>SIP Simulator & Gold</span>
          </button>
          <button
            onClick={() => onNavigate('saas')}
            className="px-3 py-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-bold text-indigo-700 flex items-center space-x-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Merchant SaaS Hub</span>
          </button>
          <button
            onClick={onOpenAiAdvisor}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs hover:bg-indigo-700"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Affordability Check</span>
          </button>
        </div>
      </div>

      {/* Main Split: AI Financial Intelligence & AutoPay Mandates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI Insights & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights Widget */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-serif">
                    AI Financial Intelligence
                  </h2>
                  <p className="text-xs text-slate-500">Autonomous cash-flow optimizations for your profile</p>
                </div>
              </div>
              <button
                onClick={onOpenAiAdvisor}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>Ask Advisor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data?.aiInsights && data.aiInsights.length > 0 ? (
                data.aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                          {insight.category}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          insight.impact === 'high' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {insight.impact} impact
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{insight.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                    {insight.actionable && (
                      <button
                        onClick={onOpenAiAdvisor}
                        className="mt-3 text-[11px] font-bold text-indigo-600 hover:underline flex items-center"
                      >
                        <span>Analyze Details</span>
                        <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 sm:col-span-2 text-center text-xs text-slate-500">
                  All systems green. Your cash-flow buffer covers 3.4 months of living expenses.
                </div>
              )}
            </div>
          </div>

          {/* Unified Transactions Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Recent Transactions & Activities
              </h2>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View Ledger
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                data.recentTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                        tx.type === 'credit'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.category === 'Commerce'
                          ? 'bg-indigo-100 text-indigo-800'
                          : tx.category === 'Investment'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{tx.description}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • {tx.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black ${
                        tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatInr(tx.amount)}
                      </span>
                      <span className="block text-[10px] text-slate-400 capitalize">{tx.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No recent transactions recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: AutoPay Mandates & Quick Pay */}
        <div className="space-y-6">
          {/* Active AutoPay Mandates */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 font-serif">
                AutoPay Mandates
              </h2>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {data?.autopayMandates?.length || 0} active
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Recurring recurring utility and investment commitments approved on your UPI handle.
            </p>

            <div className="space-y-3">
              {data?.autopayMandates && data.autopayMandates.length > 0 ? (
                data.autopayMandates.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.payee}</span>
                      <span className="font-black text-slate-900">{formatInr(m.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{m.frequency}</span>
                      <span className="text-indigo-600 font-medium">Due {new Date(m.nextDueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  No recurring mandates scheduled.
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('payments')}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recurring AutoPay</span>
            </button>
          </div>

          {/* Quick Lending Split Promo */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-3xl p-6 shadow-lg space-y-4">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">Instant Split-in-3 at Checkout</h3>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                Pay 1/3 today, and the rest in 2 monthly installments at 0% interest with zero processing fees.
              </p>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="w-full py-2.5 bg-white hover:bg-indigo-50 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Explore Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
