import React, { FormEvent, useMemo, useState } from 'react';
import { LogIn, Lock, ShieldCheck, Smartphone, ArrowRight, Chrome, Banknote, Palette } from 'lucide-react';
import { StorageService } from '../services/storage';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

const brandPalette = {
  emerald: 'from-emerald-500 via-emerald-600 to-emerald-700',
  slate: 'text-slate-600',
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const brand = StorageService.getSettings().brand;

  const isFormValid = useMemo(() => email.trim() !== '' && password.trim() !== '' && name.trim() !== '', [email, password, name]);

  const handleGoogleLogin = () => {
    const profile: UserProfile = {
      name: name.trim() || 'Google User',
      email: email.trim() || 'you@evw.pk',
      role: 'Owner / Admin',
      provider: 'Google',
    };
    onLogin(profile);
    if (remember) StorageService.saveUserProfile(profile);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isFormValid) {
      setError('Please add your name, email, and password to continue.');
      return;
    }
    setError('');
    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      role: 'Owner / Admin',
      provider: 'Email',
    };
    onLogin(profile);
    if (remember) StorageService.saveUserProfile(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(52,211,153,0.3),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(34,197,235,0.2),transparent_20%),radial-gradient(circle_at_60%_70%,rgba(16,185,129,0.25),transparent_20%)]" />
      <div className="relative flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 p-8 lg:p-14 flex flex-col justify-between space-y-8 bg-gradient-to-br from-black/10 via-slate-900/70 to-emerald-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-black">
                EV
              </div>
              <div>
                <p className="text-sm text-emerald-200 uppercase tracking-[0.3em]">{brand.companyName}</p>
                <p className="text-lg font-semibold text-white/90">{brand.tagline}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-emerald-100 bg-white/10 border border-white/10 rounded-full px-4 py-2">
              <ShieldCheck size={16} /> PKR Ready · Vape industry first
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">Scale EVW from kiosk to multi-country ERP</p>
            <p className="text-lg text-emerald-50/90 leading-relaxed max-w-3xl">
              Beautiful onboarding, EVW-branded invoices with bank details, WhatsApp sharing, Google sign-in, and multi-branch readiness from day one.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[{ label: 'Invoices & WhatsApp share', icon: Smartphone }, { label: 'Multi-branch PKR banking', icon: Banknote }, { label: 'Cloud backups + audit', icon: ShieldCheck }].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3 shadow-sm">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-200">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-emerald-100/70">Ready out of the box</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Flavor + mg variants", "Batch + expiry", "Retail/Wholesale/Bulk pricing", "Fast barcode search"].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-emerald-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" /> {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-white/10 backdrop-blur-xl border-l border-white/5">
          <div className="w-full max-w-md space-y-8 bg-white text-slate-900 rounded-2xl shadow-2xl p-6 lg:p-8">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center rounded-full" style={{ background: brand.accentColor + '20', color: brand.brandColor }}>
                <LogIn />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Sign in to EVW</h1>
              <p className="text-sm text-slate-500">Google or email sign-in with invoice-ready branding.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2"><Palette size={14} className="text-emerald-600" /> {brand.companyName}</div>
                <span className="text-emerald-600 font-semibold">PKR · Vape</span>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ayesha Khan"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@evw.pk"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-xs text-emerald-600 inline-flex items-center gap-1"><Lock size={14} /> Device encrypted</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me (store profile locally)
              </label>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full flex items-center justify-center rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition ${brandPalette.emerald} hover:shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                Continue to Dashboard
                <ArrowRight size={18} className="ml-2" />
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center rounded-xl px-4 py-3 font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200"
              >
                <Chrome size={18} className="mr-2" /> Continue with Google
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[{ label: 'WhatsApp invoices', icon: Smartphone }, { label: 'Cloud backups', icon: ShieldCheck }].map((item) => (
                <div key={item.label} className="flex items-center space-x-3 rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                  <div className="rounded-lg bg-emerald-50 text-emerald-600 p-2">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">Built-in and ready to use</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
