import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock, CreditCard } from 'lucide-react';

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
              <h3 className="font-bold text-white text-sm">Complimentary Shipping</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">Free standard shipping on all orders over $100 with insured door-to-door delivery tracking.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 border border-slate-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Stripe Payment Security</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">End-to-end encrypted transactions supporting Visa, Mastercard, Apple Pay, and Google Pay.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">30-Day Evaluation Window</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">Test your gear in your daily workflow. Return for a full refund if not completely satisfied.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-purple-400 border border-slate-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">PostgreSQL & Docker Ready</h3>
              <p className="text-slate-400 mt-1 leading-relaxed">Engineered with high performance relational schema, JWT auth, and containerized Docker composition.</p>
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
                N
              </div>
              <span className="text-lg font-black text-white font-serif tracking-tight">NEXUS</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Curated everyday equipment engineered for creators, engineers, and minimalist travelers.
            </p>
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>PCI-DSS Level 1 Compliant</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Product Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Audio & Acoustics</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Smart Workspace</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Wearables & Fitness</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Modern Lifestyle</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Platform Architecture</h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>React 19 & Vite Front-End</li>
              <li>Node.js / Express API</li>
              <li>PostgreSQL Relational DB</li>
              <li>JWT Stateless Security</li>
              <li>Docker Multi-Stage Container</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Order Support</h4>
            <p className="text-xs text-slate-400 mb-3">
              Need assistance with an existing shipment or custom corporate order?
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 text-xs">
              <span className="block text-[11px] text-slate-500">Live Support Dispatch</span>
              <span className="font-mono text-white font-bold">support@nexuscommerce.com</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs gap-3">
          <p>© {new Date().getFullYear()} Nexus Commerce Studio. All rights reserved.</p>
          <div className="flex space-x-6 text-slate-400">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
