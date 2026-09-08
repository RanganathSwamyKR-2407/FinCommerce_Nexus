import React, { useState, useEffect } from 'react';
import {
  Send,
  QrCode,
  Repeat,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { Transaction, AutoPayMandate } from '../types/index.js';
import { formatInr } from '../utils/format.js';

export const PaymentsView: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState<'send' | 'qr' | 'autopay' | 'ledger'>('send');
  const [bankBalance, setBankBalance] = useState<number>(user?.bankBalance || 48500);

  // Send UPI State
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<any | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Transactions Ledger State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  // AutoPay Mandates State
  const [mandates, setMandates] = useState<AutoPayMandate[]>([]);
  const [newPayee, setNewPayee] = useState('');
  const [newMandateAmount, setNewMandateAmount] = useState('');
  const [newFrequency, setNewFrequency] = useState<'monthly' | 'quarterly' | 'weekly'>('monthly');
  const [isCreatingMandate, setIsCreatingMandate] = useState(false);

  // QR State
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchMandates();
  }, [token]);

  useEffect(() => {
    if (user?.bankBalance !== undefined) {
      setBankBalance(user.bankBalance);
    }
  }, [user]);

  const fetchTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/payments/transactions', { headers });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTx(false);
    }
  };

  const fetchMandates = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/payments/mandates', { headers });
      if (res.ok) {
        const data = await res.json();
        setMandates(data.mandates || []);
      }
    } catch (err) {
      console.error('Failed to load mandates:', err);
    }
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(sendAmount);
    if (!recipient.trim() || isNaN(amountNum) || amountNum <= 0) {
      setSendError('Please provide a valid recipient UPI ID/mobile number and amount.');
      return;
    }
    if (amountNum > bankBalance) {
      setSendError(`Insufficient bank balance. Available: ${formatInr(bankBalance)}`);
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/payments/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipientUpi: recipient.trim(),
          amount: amountNum,
          note: sendNote.trim() || 'UPI Transfer via FinCommerce',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process UPI transfer');
      }

      setSendSuccess(data);
      setBankBalance(data.remainingBalance);
      await refreshUser();
      showToast(`Successfully transferred ${formatInr(amountNum)} to ${recipient}.`, 'success');
      setRecipient('');
      setSendAmount('');
      setSendNote('');
      fetchTransactions();
    } catch (err: any) {
      setSendError(err.message || 'Transfer failed. Check network connection.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newMandateAmount);
    if (!newPayee.trim() || isNaN(amountNum) || amountNum <= 0) {
      showToast('Please specify valid payee and amount.', 'error');
      return;
    }

    setIsCreatingMandate(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/payments/mandates', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          payee: newPayee.trim(),
          amount: amountNum,
          frequency: newFrequency,
        }),
      });

      if (res.ok) {
        showToast(`AutoPay Mandate created for ${newPayee}.`, 'success');
        setNewPayee('');
        setNewMandateAmount('');
        fetchMandates();
      }
    } catch {
      showToast('Failed to create AutoPay mandate.', 'error');
    } finally {
      setIsCreatingMandate(false);
    }
  };

  const copyUpiId = () => {
    const upi = user?.upiId || 'priya@oksbi';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header & Balance Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Smartphone className="w-4 h-4" />
            <span>NPCI Unified Payments Interface</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            UPI & Payments Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Instant peer-to-peer transfers, merchant QR scanning, and recurring AutoPay mandates.
          </p>
        </div>

        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between min-w-[280px]">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
              UPI Bank Balance
            </span>
            <span className="text-2xl font-black tracking-tight">{formatInr(bankBalance)}</span>
            <p className="text-[10px] text-emerald-400 mt-0.5">● HDFC Linked Account (5401)</p>
          </div>
          <button
            onClick={fetchTransactions}
            aria-label="Refresh balance"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => setActiveTab('send')}
          className={`pb-3 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'send'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Send Money / Transfer</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`pb-3 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'qr'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Receive & Bharat QR</span>
        </button>

        <button
          onClick={() => setActiveTab('autopay')}
          className={`pb-3 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'autopay'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>AutoPay Mandates ({mandates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 flex items-center space-x-2 transition-colors whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transaction Ledger</span>
        </button>
      </div>

      {/* TAB 1: SEND MONEY */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Instant UPI Transfer
              </h2>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center">
                <Zap className="w-3 h-3 mr-1" /> 0% Transaction Fees
              </span>
            </div>

            {sendError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{sendError}</span>
              </div>
            )}

            {sendSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>UPI Payment Successful!</span>
                </div>
                <div className="font-mono text-[11px] text-emerald-900">
                  Transaction Ref: {sendSuccess.transactionId}
                </div>
                <div className="text-[11px] text-emerald-800">
                  New available bank balance: {formatInr(sendSuccess.remainingBalance)}
                </div>
              </div>
            )}

            <form onSubmit={handleSendPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Recipient Virtual Payment Address (VPA) or Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. rahul@okaxis or 9876543210"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports Google Pay, PhonePe, Paytm, BHIM, and bank VPAs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Amount in Rupees (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="500"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 font-mono font-bold focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Transfer Note (Optional)
                </label>
                <input
                  type="text"
                  value={sendNote}
                  onChange={(e) => setSendNote(e.target.value)}
                  placeholder="Dinner split, electronics, rent, or maintenance"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing with NPCI UPI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transfer Now with UPI PIN-less Lite</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* Quick Contacts */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Frequent UPI Contacts
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: 'Arjun Verma', vpa: 'arjun@okaxis', bank: 'Axis Bank' },
                  { name: 'Pooja Iyer', vpa: 'pooja@paytm', bank: 'Paytm Bank' },
                  { name: 'Ramesh Stores', vpa: 'ramesh.grocery@icici', bank: 'ICICI Merchant' },
                ].map((c) => (
                  <button
                    key={c.vpa}
                    type="button"
                    onClick={() => {
                      setRecipient(c.vpa);
                      setSendNote(`Payment to ${c.name}`);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{c.vpa}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-medium">{c.bank}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI Safety Tip */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>NPCI Safe Banking</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                You never need to enter your UPI PIN to receive money. Always verify the receiver's verified merchant badge before completing transfers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECEIVE & QR CODE */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
              <QrCode className="w-3.5 h-3.5" />
              <span>Personal UPI QR Code</span>
            </div>

            <div className="mx-auto w-48 h-48 bg-slate-100 border-2 border-slate-900 rounded-2xl p-3 flex flex-col items-center justify-center relative shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-4">
                <QrCode className="w-24 h-24 stroke-1 text-white" />
                <span className="text-[9px] font-mono mt-1 text-slate-300">Scan via any UPI App</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name || 'Priya Sharma'}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.upiId || 'priya@oksbi'}</p>
            </div>

            <button
              onClick={copyUpiId}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>UPI ID Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy UPI ID</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Accepted Everywhere Across India
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This dynamic QR code allows friends, family, or clients to transfer money directly into your linked bank account with zero settlement delays.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-xs text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Instant credit with 0% gateway commission</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Compatible with GPay, PhonePe, Paytm, and 120+ banks</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                  <span>Automatic round-up micro-savings enabled</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px] font-bold uppercase">Linked Bank Account</span>
              <span className="font-bold text-slate-900 text-sm">HDFC Bank •••• 5401</span>
              <span className="block text-[11px] text-emerald-700 font-medium">IFSC: HDFC0000240</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOPAY MANDATES */}
      {activeTab === 'autopay' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Recurring AutoPay Mandates
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {mandates.length} registered
              </span>
            </div>

            <div className="space-y-3">
              {mandates.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {m.payee.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{m.payee}</h4>
                      <p className="text-xs text-slate-500">
                        {m.frequency} • Next billing on {new Date(m.nextDueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 block">
                      {formatInr(m.amount)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Mandate Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Setup New AutoPay
            </h3>
            <p className="text-xs text-slate-500">
              Authorize automated recurring debits for electricity, broadband, mutual fund SIPs, or insurance.
            </p>

            <form onSubmit={handleCreateMandate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payee / Merchant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPayee}
                  onChange={(e) => setNewPayee(e.target.value)}
                  placeholder="e.g. BESCOM Electricity or Netflix"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={newMandateAmount}
                  onChange={(e) => setNewMandateAmount(e.target.value)}
                  placeholder="1499"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Frequency
                </label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as any)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreatingMandate}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create AutoPay Mandate</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSACTION LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Consolidated Financial Ledger
              </h2>
              <p className="text-xs text-slate-500">All UPI, commerce, and investment movements</p>
            </div>
            <button
              onClick={fetchTransactions}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">{tx.method}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${
                      tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatInr(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
