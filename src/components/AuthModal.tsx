import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus trap, lock body scroll and escape key listener
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => emailInputRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal, isSubmitting]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const result = await login(email.trim(), password);
        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
          return;
        }
        showToast('Successfully signed in!', 'success');
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMessage('Please enter a valid email address.');
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          return;
        }
        const result = await register(name.trim(), email.trim(), password);
        if (!result.success) {
          setErrorMessage(result.error || 'Registration failed. Please check your details.');
          return;
        }
        showToast('Welcome to FinCommerce! Your account has been created.', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFillPriya = () => {
    setEmail('priya.sharma@fincommerce.in');
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleDemoFillAlex = () => {
    setEmail('alex@nexuscommerce.com');
    setPassword('Password123!');
    setErrorMessage(null);
  };

  const handleDemoFillRegister = () => {
    setName('Rohan Verma');
    setEmail(`rohan.verma${Math.floor(100 + Math.random() * 900)}@fincommerce.in`);
    setPassword('Pass@123456');
    setErrorMessage(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close button */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
              F
            </div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-slate-800">
              FinCommerce Account
            </span>
          </div>
          <button
            ref={closeBtnRef}
            onClick={closeAuthModal}
            aria-label="Close authentication modal"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Title & Mode Switcher */}
          <div className="text-center space-y-1">
            <h2 id="auth-modal-title" className="text-2xl font-black text-slate-900 font-serif">
              {authMode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-600">
              {authMode === 'signin'
                ? 'Sign in to access your UPI payments, active loans & orders.'
                : 'Join FinCommerce to unlock instant credit & smart shopping.'}
            </p>
          </div>

          {/* Accessible Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl" role="tablist" aria-label="Authentication modes">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signin'}
              id="tab-signin"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signup'}
              id="tab-signup"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Demo User Fast-Fill Buttons */}
          {authMode === 'signin' ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleDemoFillPriya}
                className="w-full py-2 px-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-between focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                  <span>Autofill Priya Sharma (UPI & Credit Active)</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-mono">₹48.5K Bal</span>
              </button>
              <button
                type="button"
                onClick={handleDemoFillAlex}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Autofill Alex Mercer (Standard User)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">alex@nexuscommerce.com</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDemoFillRegister}
              className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Autofill New User Sample (Rohan Verma)</span>
            </button>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'signup' && (
              <div>
                <label htmlFor="auth-name-input" className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="auth-name-input"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:bg-white focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email-input" className="block text-xs font-bold text-slate-800 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  ref={emailInputRef}
                  type="email"
                  id="auth-email-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:bg-white focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password-input" className="block text-xs font-bold text-slate-800 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="auth-password-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:bg-white focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="auth-submit-btn"
              aria-busy={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create FinCommerce Account'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500 space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>JWT Secure HMAC SHA-256 Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
