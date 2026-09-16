import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Repeat,
  Key,
  BrainCircuit,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  ExternalLink,
  Send,
  Play,
  Pause,
  Calendar,
  Building2,
  ChevronRight,
  Download,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import {
  SaasOverviewData,
  SaasPlan,
  SaasInvoice,
  SaasCustomerSubscription,
  SaasApiKey,
  SaasWebhookLog,
} from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

interface SaasViewProps {
  onNavigateToCatalog?: () => void;
  onNavigateToDashboard?: () => void;
}

export const SaasView: React.FC<SaasViewProps> = ({ onNavigateToCatalog, onNavigateToDashboard }) => {
  const { user } = useAuth();
  const [data, setData] = useState<SaasOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'invoicing' | 'autopay' | 'developers' | 'intelligence'>('plans');

  // Plan subscription state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<SaasPlan | null>(null);
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState<'upi_autopay' | 'credit_line' | 'hdfc_netbanking'>('upi_autopay');
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);

  // Invoice creation state
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState<boolean>(false);
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '',
    clientGstin: '',
    clientEmail: '',
    clientState: 'Karnataka (29)',
    itemDescription: '',
    hsnCode: '998311',
    subtotal: '',
    taxRate: '18',
    dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
  });
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false);

  // Webhook and API key testing state
  const [isGeneratingKey, setIsGeneratingKey] = useState<boolean>(false);
  const [selectedWebhookEvent, setSelectedWebhookEvent] = useState<string>('payment.captured');
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState<boolean>(false);
  const [lastWebhookResponse, setLastWebhookResponse] = useState<SaasWebhookLog | null>(null);

  // Copied indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Action feedback message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/saas/overview');
      if (!res.ok) throw new Error('Failed to fetch SaaS data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: err.message || 'Error loading SaaS hub', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 1. Plan Upgrade Action
  const handleUpgradePlan = async (planId: 'starter' | 'growth' | 'enterprise') => {
    try {
      setIsSubscribing(true);
      const res = await fetch('/api/saas/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          paymentMethod: upgradePaymentMethod,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update plan');

      showToast(result.message || 'Plan activated successfully!');
      setSelectedPlanToUpgrade(null);
      await fetchOverview();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  // 2. Invoice Creation Action
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.clientName || !invoiceForm.clientEmail || !invoiceForm.itemDescription || !invoiceForm.subtotal) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    try {
      setIsCreatingInvoice(true);
      const res = await fetch('/api/saas/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceForm,
          subtotal: Number(invoiceForm.subtotal),
          taxRate: Number(invoiceForm.taxRate),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to generate invoice');

      showToast('GST E-Invoice generated with digital IRN hash!');
      setIsCreateInvoiceOpen(false);
      setInvoiceForm({
        clientName: '',
        clientGstin: '',
        clientEmail: '',
        clientState: 'Karnataka (29)',
        itemDescription: '',
        hsnCode: '998311',
        subtotal: '',
        taxRate: '18',
        dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
      await fetchOverview();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // 3. Mark Invoice Status
  const handleUpdateInvoiceStatus = async (invoiceId: string, status: 'paid' | 'pending' | 'overdue') => {
    try {
      const res = await fetch(`/api/saas/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update invoice');
      showToast(`Invoice ${invoiceId} marked as ${status.toUpperCase()}!`);
      await fetchOverview();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // 4. Toggle Customer Subscription
  const handleToggleCustomerSubscription = async (subId: string) => {
    try {
      const res = await fetch(`/api/saas/customer-subscriptions/${subId}/toggle`, {
        method: 'POST',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to toggle subscription');
      showToast(result.message);
      await fetchOverview();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // 5. Run Customer Autopay Charge
  const handleChargeCustomer = async (subId: string) => {
    try {
      const res = await fetch(`/api/saas/customer-subscriptions/${subId}/charge`, {
        method: 'POST',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to charge subscription');
      showToast(result.message);
      await fetchOverview();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // 6. Generate API Key
  const handleGenerateApiKey = async (keyType: 'live' | 'test') => {
    try {
      setIsGeneratingKey(true);
      const res = await fetch('/api/saas/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyType,
          name: `${keyType === 'live' ? 'Production' : 'Sandbox'} Token (${new Date().toLocaleDateString('en-IN')})`,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to generate key');
      showToast(result.message);
      await fetchOverview();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // 7. Simulate Webhook
  const handleSimulateWebhook = async () => {
    try {
      setIsSimulatingWebhook(true);
      const res = await fetch('/api/saas/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: selectedWebhookEvent }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to simulate webhook');
      showToast(result.message);
      setLastWebhookResponse(result.webhookLog);
      await fetchOverview();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Loading Merchant SaaS & Cloud Platform...</h3>
        <p className="text-xs text-slate-500 mt-1">Connecting to Indian GST e-invoicing and UPI Autopay engines</p>
      </div>
    );
  }

  const { subscription, plans = [], invoices = [], customerSubscriptions = [], apiKeys = [], webhookLogs = [], analytics } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Toast Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-md transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border border-emerald-700'
              : 'bg-rose-900 text-rose-100 border border-rose-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 px-2 py-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Layers className="w-3.5 h-3.5 mr-1" />
                FinCommerce Cloud OS
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5 mr-1" />
                NPCI & GSTN Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
              Merchant SaaS & Cloud Billing Suite
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              Automate Indian GST e-invoicing with instant IRN generation, manage UPI Autopay recurring customer revenue,
              and integrate developer payment APIs for enterprise commerce.
            </p>
          </div>

          {/* Current Subscription Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 text-white min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">Active Plan</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase">
                {subscription?.status || 'Active'}
              </span>
            </div>
            <p className="text-xl font-bold">{subscription?.planName || 'Growth Business Pro'}</p>
            <p className="text-xs text-slate-300 mt-1">
              ₹{(subscription?.amount || 1499).toLocaleString('en-IN')} / {subscription?.billingCycle || 'month'}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
              <span>Next Renewal:</span>
              <span className="font-semibold text-white">{subscription?.nextBillingDate || '2026-10-01'}</span>
            </div>
          </div>
        </div>

        {/* Real-time SaaS Metrics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/60">
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
            <span className="text-[11px] text-indigo-300 font-medium block">Monthly Recurring (MRR)</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white">
                ₹{(analytics?.mrr || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +14.2%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">ARR: ₹{(analytics?.arr || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
            <span className="text-[11px] text-indigo-300 font-medium block">Active Autopay Mandates</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white">
                {analytics?.activeSubscribers || 0}
              </span>
              <span className="text-[11px] text-indigo-300">Customers</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">0% involuntary churn</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
            <span className="text-[11px] text-indigo-300 font-medium block">GST Invoiced (Month)</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white">
                ₹{(analytics?.totalInvoicedMonth || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-amber-300 mt-0.5 block">
              Pending: ₹{(analytics?.receivablesPending || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
            <span className="text-[11px] text-indigo-300 font-medium block">Cash Runway</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white">
                {analytics?.cashRunwayMonths || 14.6}
              </span>
              <span className="text-[11px] text-indigo-300">Months</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">Zero debt liability</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-2">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>SaaS Plans & Subscription</span>
        </button>

        <button
          onClick={() => setActiveTab('invoicing')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'invoicing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>GST E-Invoicing ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('autopay')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'autopay'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>UPI Autopay Billing ({customerSubscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('developers')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'developers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Developer APIs & Webhooks</span>
        </button>

        <button
          onClick={() => setActiveTab('intelligence')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'intelligence'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>AI Cash Flow & Insights</span>
        </button>
      </div>

      {/* TAB 1: SAAS PLANS & UPGRADE */}
      {activeTab === 'plans' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Billing Cycle Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Choose the Right Tier for Your Commerce Growth</h2>
              <p className="text-xs text-slate-500">
                Cancel or upgrade at any time with transparent NPCI UPI Autopay billing.
              </p>
            </div>

            <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = subscription?.planId === plan.id;
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                    plan.recommended
                      ? 'bg-gradient-to-b from-indigo-50/70 to-white border-2 border-indigo-600 shadow-lg'
                      : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm tracking-wider">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      {isCurrent && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 min-h-[32px]">{plan.tagline}</p>

                    {/* Pricing */}
                    <div className="my-6 pb-6 border-b border-slate-100">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900">
                          {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
                        </span>
                        {price > 0 && (
                          <span className="text-xs text-slate-500 font-medium">
                            /{billingCycle === 'annual' ? 'year' : 'month'}
                          </span>
                        )}
                      </div>
                      {billingCycle === 'annual' && price > 0 && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                          Equivalent to ₹{Math.round(price / 12).toLocaleString('en-IN')} / month
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Included Capabilities</p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start text-xs text-slate-700">
                            <Check className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Plan CTA */}
                  <div className="mt-8 pt-4">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold cursor-default"
                      >
                        Currently Active
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPlanToUpgrade(plan)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          plan.recommended
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {price === 0 ? 'Switch to Starter' : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upgrade Confirmation Modal */}
          {selectedPlanToUpgrade && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Activate {selectedPlanToUpgrade.name}</h3>
                      <p className="text-xs text-slate-500">{billingCycle.toUpperCase()} Subscription</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlanToUpgrade(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Plan:</span>
                    <span className="font-bold text-slate-900">{selectedPlanToUpgrade.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Billing Cycle:</span>
                    <span className="font-bold text-slate-900 capitalize">{billingCycle}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Total Charge:</span>
                    <span className="font-black text-indigo-700 text-sm">
                      ₹
                      {(billingCycle === 'annual'
                        ? selectedPlanToUpgrade.annualPrice
                        : selectedPlanToUpgrade.monthlyPrice
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 mb-6">
                  <label className="text-xs font-bold text-slate-800 block">Select Debit Source</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="radio"
                          name="upgrade_pm"
                          checked={upgradePaymentMethod === 'upi_autopay'}
                          onChange={() => setUpgradePaymentMethod('upi_autopay')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">UPI AutoPay Mandate (NPCI)</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Instant Setup</span>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="radio"
                          name="upgrade_pm"
                          checked={upgradePaymentMethod === 'credit_line'}
                          onChange={() => setUpgradePaymentMethod('credit_line')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">FinCommerce 0% Credit Line</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold">Split in 3</span>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="radio"
                          name="upgrade_pm"
                          checked={upgradePaymentMethod === 'hdfc_netbanking'}
                          onChange={() => setUpgradePaymentMethod('hdfc_netbanking')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">HDFC Bank Direct Account</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">••• 8821</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedPlanToUpgrade(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpgradePlan(selectedPlanToUpgrade.id)}
                    disabled={isSubscribing}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    {isSubscribing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Activating Mandate...</span>
                      </>
                    ) : (
                      <span>Confirm & Activate</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GST E-INVOICING */}
      {activeTab === 'invoicing' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Indian GST E-Invoices & E-Way Portal</h2>
              <p className="text-xs text-slate-500">
                Government IRP signed digital invoices with automated CGST/SGST/IGST compliance and QR code verification.
              </p>
            </div>
            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create GST E-Invoice</span>
            </button>
          </div>

          {/* Invoices List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Invoice No & Date</th>
                    <th className="py-3.5 px-4">Client / GSTIN</th>
                    <th className="py-3.5 px-4">Item & HSN</th>
                    <th className="py-3.5 px-4">Tax Breakdown</th>
                    <th className="py-3.5 px-4">Total (INR)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No GST invoices generated yet. Click "Create GST E-Invoice" above.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Due: {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                          </p>
                        </td>

                        <td className="py-4 px-4 max-w-[220px]">
                          <p className="font-semibold text-slate-900 truncate">{inv.clientName}</p>
                          <p className="text-[11px] text-indigo-600 font-mono mt-0.5 truncate">
                            GSTIN: {inv.clientGstin}
                          </p>
                          <p className="text-[10px] text-slate-400">{inv.clientState}</p>
                        </td>

                        <td className="py-4 px-4 max-w-[240px]">
                          <p className="text-slate-800 line-clamp-1">{inv.itemDescription}</p>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            HSN: {inv.hsnCode}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px]">
                          {inv.igst > 0 ? (
                            <span className="text-purple-700">IGST: ₹{inv.igst.toLocaleString('en-IN')}</span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-slate-600 block">CGST: ₹{inv.cgst.toLocaleString('en-IN')}</span>
                              <span className="text-slate-600 block">SGST: ₹{inv.sgst.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-black text-slate-900 text-sm">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {inv.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateInvoiceStatus(inv.id, 'paid')}
                                title="Mark as Paid"
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleCopy(inv.paymentLink, inv.id)}
                              title="Copy Payment Link"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            >
                              {copiedId === inv.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Create Invoice */}
          {isCreateInvoiceOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">New GST E-Invoice with IRN</h3>
                      <p className="text-xs text-slate-500">Real-time Indian GST compliance handshake</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateInvoiceOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateInvoice} className="space-y-4 my-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Client Business Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Swiggy Bundl Technologies Pvt Ltd"
                        value={invoiceForm.clientName}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Client GSTIN (15 Digits)</label>
                      <input
                        type="text"
                        placeholder="e.g. 29AAACB1234F1Z9"
                        value={invoiceForm.clientGstin}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientGstin: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Billing Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="finance@client.com"
                        value={invoiceForm.clientEmail}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Client State (Place of Supply)</label>
                      <select
                        value={invoiceForm.clientState}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientState: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Karnataka (29)">Karnataka (Intra-state: CGST + SGST)</option>
                        <option value="Maharashtra (27)">Maharashtra (Inter-state: IGST)</option>
                        <option value="Delhi (07)">Delhi (Inter-state: IGST)</option>
                        <option value="Tamil Nadu (33)">Tamil Nadu (Inter-state: IGST)</option>
                        <option value="Telangana (36)">Telangana (Inter-state: IGST)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Item / Service Description *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. FinCommerce 4G Soundbox Pro & POS Terminals Annual Cloud Service"
                      value={invoiceForm.itemDescription}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, itemDescription: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">HSN / SAC Code</label>
                      <input
                        type="text"
                        value={invoiceForm.hsnCode}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, hsnCode: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Subtotal (INR) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="25000"
                        value={invoiceForm.subtotal}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">GST Rate</label>
                      <select
                        value={invoiceForm.taxRate}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      >
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST (Standard)</option>
                        <option value="28">28% GST</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreateInvoiceOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingInvoice}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
                    >
                      {isCreatingInvoice ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Signing IRN with IRP...</span>
                        </>
                      ) : (
                        <span>Generate & Dispatch Invoice</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPI AUTOPAY RECURRING BILLING */}
      {activeTab === 'autopay' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">UPI Autopay Recurring Revenue Engine</h2>
              <p className="text-xs text-slate-500">
                NPCI compliant recurring pull mandates for subscriptions, retail retainers, and merchant SaaS customers.
              </p>
            </div>
            <div className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>UPI Autopay Engine 100% Operational</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerSubscriptions.map((csub) => (
              <div
                key={csub.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{csub.customerName}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        csub.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {csub.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{csub.planName}</p>

                  <div className="my-3 p-3 bg-slate-50 rounded-xl space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer UPI:</span>
                      <span className="font-semibold text-slate-800">{csub.customerUpi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mandate UMN:</span>
                      <span className="text-indigo-600 font-semibold truncate max-w-[170px]">{csub.mandateRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Recurring Amount:</span>
                      <span className="font-bold text-slate-900 text-xs">₹{csub.mrrAmount.toLocaleString('en-IN')} / {csub.frequency}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Next Scheduled Charge:</span>
                      <span className="text-slate-700">{csub.nextChargeDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleChargeCustomer(csub.id)}
                    disabled={csub.status !== 'active'}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Instant Debit</span>
                  </button>

                  <button
                    onClick={() => handleToggleCustomerSubscription(csub.id)}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center space-x-1"
                  >
                    {csub.status === 'active' ? (
                      <>
                        <Pause className="w-3 h-3 text-amber-600" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-emerald-600" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEVELOPER APIS & WEBHOOKS */}
      {activeTab === 'developers' && (
        <div className="space-y-8 animate-in fade-in">
          {/* API Keys */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Developer API Keys</h2>
                <p className="text-xs text-slate-500">
                  Authenticate your backend or POS hardware with FinCommerce RESTful APIs.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleGenerateApiKey('test')}
                  disabled={isGeneratingKey}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  + Sandbox Key
                </button>
                <button
                  onClick={() => handleGenerateApiKey('live')}
                  disabled={isGeneratingKey}
                  className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
                >
                  + Live Production Key
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          key.keyType === 'live' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {key.keyType}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{key.name}</span>
                    </div>
                    <p className="font-mono text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 select-all inline-block">
                      {key.fullKey || key.maskedKey}
                    </p>
                    <p className="text-[10px] text-slate-400">Created: {new Date(key.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>

                  <button
                    onClick={() => handleCopy(key.fullKey || key.maskedKey, key.id)}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 self-start sm:self-center"
                  >
                    {copiedId === key.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Simulator & Delivery Logs */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Webhook Simulation & Delivery Logs</h3>
              <p className="text-xs text-slate-500">
                Trigger simulated live events to test your CRM or e-commerce endpoint handler.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Simulate Event:</span>
              <select
                value={selectedWebhookEvent}
                onChange={(e) => setSelectedWebhookEvent(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="payment.captured">payment.captured (UPI / QR Payment)</option>
                <option value="subscription.renewed">subscription.renewed (Autopay Recurring)</option>
                <option value="invoice.paid">invoice.paid (B2B GST Settlement)</option>
                <option value="mandate.authorized">mandate.authorized (New Mandate Registration)</option>
              </select>

              <button
                onClick={handleSimulateWebhook}
                disabled={isSimulatingWebhook}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSimulatingWebhook ? 'Dispatching...' : 'Dispatch Test Webhook'}</span>
              </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">HTTP Response</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {webhookLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-bold text-indigo-700">{log.event}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{log.httpCode} OK</td>
                        <td className="py-3 px-4 text-slate-500 font-sans">
                          {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setLastWebhookResponse(log)}
                            className="text-xs text-indigo-600 hover:underline font-sans font-semibold"
                          >
                            View JSON
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* JSON Payload Inspector */}
            {lastWebhookResponse && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Payload Inspector: {lastWebhookResponse.event}
                  </span>
                  <button
                    onClick={() => setLastWebhookResponse(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <pre className="text-xs font-mono overflow-x-auto text-indigo-200">
                  {JSON.stringify(lastWebhookResponse.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AI CASH FLOW & INSIGHTS */}
      {activeTab === 'intelligence' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">AI Cash Flow Predictive Forecaster</h2>
            <p className="text-xs text-slate-500">
              Generative financial intelligence analyzing Indian retail seasonal trends, advance GST liabilities, and working capital cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">6-Month Projected Revenue Trajectory</h3>
                  <p className="text-xs text-slate-500">Incorporating recurring UPI Autopay retention & festive sales lift</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +28.4% FY26 CAGR
                </span>
              </div>

              {/* Visual projection bars */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Oct 2026 (Navratri / Diwali Festive Boom)</span>
                    <span className="font-bold text-slate-900">₹1,85,000 (Projected)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Nov 2026 (Wedding Season Inflow)</span>
                    <span className="font-bold text-slate-900">₹1,62,000</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Dec 2026 (Year-End Enterprise Renewals)</span>
                    <span className="font-bold text-slate-900">₹1,48,000</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Jan 2027 (Baseline Recurring SaaS)</span>
                    <span className="font-bold text-slate-900">₹1,25,000</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-md">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-indigo-300">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-xs uppercase font-extrabold tracking-wider">AI Executive Action</span>
                </div>
                <h3 className="text-lg font-bold">Recommended Working Capital Move</h3>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  You have <strong className="text-white">₹22,408</strong> in pending invoices. You can unlock 90% liquidity immediately with FinCommerce 0% Split Invoice Factoring.
                </p>
              </div>

              <div className="pt-6 border-t border-indigo-800/60 mt-6">
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full py-2.5 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 text-xs font-bold transition-all shadow-xs"
                >
                  View Credit & Working Capital
                </button>
              </div>
            </div>
          </div>

          {/* AI Insights List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Intelligence Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(analytics?.aiBusinessInsights || []).map((ins, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {ins}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
