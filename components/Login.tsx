import React, { FormEvent, useMemo, useState } from 'react';
import { LogIn, Lock, ShieldCheck, Smartphone, ArrowRight, Chrome, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (profile: { name: string; email: string; role: string }) => void;
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

  const isFormValid = useMemo(() => email.trim() !== '' && password.trim() !== '' && name.trim() !== '', [email, password, name]);

  const handleGoogleLogin = () => {
    const displayName = name.trim() || 'Google User';
    const googleEmail = email.trim() || 'you@evw.pk';
    onLogin({ name: displayName, email: googleEmail, role: 'Owner / Admin' });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isFormValid) {
      setError('Please add your name, email, and password to continue.');
      return;
    }
    setError('');
    onLogin({
      name: name.trim(),
      email: email.trim(),
      role: 'Owner / Admin',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white">
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.15),transparent_20%),radial-gradient(circle_at_60%_70%,rgba(45,212,191,0.2),transparent_25%)]" aria-hidden />
      <div className="relative flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center space-y-8">
          <div className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
            <ShieldCheck size={18} className="mr-2" />
            EVW Cloud ERP · Pakistan to Global
          </div>
          <div className="space-y-4">
            <p className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">EVW Enterprise Cloud</p>
            <p className="text-lg text-emerald-50/90 leading-relaxed max-w-2xl">
              Modern ERP built for vape wholesalers and retailers. EVW-branded invoices, PKR-ready payments, WhatsApp sharing, and cloud sync — with room to scale to every region.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'EVW-branded invoices with PKR, bank details, and WhatsApp share',
              'Flavor, mg strength, expiry, and batch-level inventory',
              'Retail, wholesale, and bulk buyer pricing with profit visibility',
              'Daily cloud backups, multi-branch access, and device sync',
            ].map((item) => (
              <div key={item} className="flex items-start space-x-3 bg-white/5 border border-white/10 rounded-xl p-3 shadow-sm">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                <p className="text-emerald-50 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <div className="inline-flex items-center px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm font-semibold">
            <Sparkles className="mr-2" size={16} /> Multi-branch · Multi-currency · Multi-country ready
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-white/5 backdrop-blur-xl border-l border-white/10">
          <div className="w-full max-w-md space-y-8 bg-white text-slate-900 rounded-2xl shadow-2xl p-6 lg:p-8">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 w-12 h-12">
                <LogIn />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Sign in to EVW</h1>
              <p className="text-sm text-slate-500">Secure access for owners, managers, cashiers, and auditors.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <button type="button" className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center">
                    <Lock size={14} className="mr-1" />
                    Secure by design
                  </button>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

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
