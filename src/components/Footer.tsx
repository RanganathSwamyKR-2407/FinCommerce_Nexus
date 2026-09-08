import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock, Smartphone, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer role="contentinfo" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-20">
      {/* Guarantees Strip */}
      <div className="border-b border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Free Express Shipping</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">Free insured door-to-door delivery on all orders over ₹999 with real-time GPS tracking.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 border border-slate-800 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">NPCI UPI & AutoPay Security</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">End-to-end encrypted 256-bit payments supporting GPay, PhonePe, Paytm, RuPay, and RBI certified banks.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Pre-Approved Credit Line</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">Instant 0% interest Split-in-3 checkout powered by explainable underwriting and cash-flow health.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">24K 99.9% Digital Gold & SIPs</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">Goal-based micro-investing and automated round-up savings stored in insured vaults.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                F
              </div>
              <span className="text-lg font-black text-white font-serif tracking-tight">FINCOMMERCE</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              India's unified financial & commerce platform: Pay, Shop, Borrow, Invest & Build Financial Resilience.
            </p>
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>RBI & NPCI Compliant Architecture</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">FinCommerce Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Embedded Electronics & Hardware</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Instant UPI & AutoPay Mandates</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Cash-Flow Based Instant Credit Line</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">24K Digital Gold & Goal SIPs</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Gemini AI Financial Intelligence</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Technology Stack</h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>React 19 & TypeScript Frontend</li>
              <li>Node.js / Express FinTech APIs</li>
              <li>Unified Financial Domain Database</li>
              <li>Gemini AI Multi-turn Financial Advisory</li>
              <li>Docker Multi-Stage Production Container</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Support & Compliance</h4>
            <p className="text-xs text-slate-400 mb-3">
              Direct assistance with UPI transfers, order fulfillment, or credit line approvals:
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 text-xs">
              <span className="block text-[11px] text-slate-500">24/7 Financial Concierge</span>
              <span className="font-mono text-white font-bold">help@fincommerce.in</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs gap-3">
          <p>© {new Date().getFullYear()} FinCommerce India Technologies Ltd. All rights reserved.</p>
          <div className="flex space-x-6 text-slate-400">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Grievance Redressal</span>
            <span>RBI Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
