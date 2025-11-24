import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Save,
  RefreshCw,
  MessageCircle,
  Banknote,
  CloudUpload,
  Palette,
  Sparkles,
  Copy,
} from 'lucide-react';
import { AdminSettings, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface SettingsProps {
  user?: UserProfile | null;
}

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [settings, setSettings] = useState<AdminSettings>(StorageService.getSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(StorageService.getSettings());
  }, []);

  const whatsappTemplate = useMemo(
    () =>
      `Hi team, new EVW invoice branding is live.\nBank: ${settings.banking.bankName}\nAccount: ${settings.banking.accountTitle}\nIBAN: ${settings.banking.iban ?? ''}\nShared from EVW Cloud ERP.`,
    [settings],
  );

  const handleSave = () => {
    StorageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappTemplate);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-emerald-500/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Admin Setup</p>
            <h1 className="text-3xl font-bold mt-2">EVW Control Center</h1>
            <p className="text-emerald-100/80 mt-2 max-w-2xl">
              Configure branding, PKR banking, backups, and invoice preferences before teams go live. All changes save locally for instant previews.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm flex items-center space-x-2">
            <ShieldCheck size={18} className="text-emerald-200" />
            <span>{user?.name || 'Owner'} · {user?.role || 'Admin'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="text-emerald-600" size={18} />
              <h2 className="font-semibold text-slate-800">Branding</h2>
            </div>
            <span className="text-xs text-slate-500">Appears on login + invoices</span>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-600 space-y-1">
              Company name
              <input
                value={settings.brand.companyName}
                onChange={(e) => setSettings({ ...settings, brand: { ...settings.brand, companyName: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600 space-y-1">
              Tagline
              <input
                value={settings.brand.tagline}
                onChange={(e) => setSettings({ ...settings, brand: { ...settings.brand, tagline: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600 space-y-1">
              Brand color
              <input
                type="color"
                value={settings.brand.brandColor}
                onChange={(e) => setSettings({ ...settings, brand: { ...settings.brand, brandColor: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 h-12"
              />
            </label>
            <label className="text-sm text-slate-600 space-y-1">
              Accent color
              <input
                type="color"
                value={settings.brand.accentColor}
                onChange={(e) => setSettings({ ...settings, brand: { ...settings.brand, accentColor: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 h-12"
              />
            </label>
            <label className="text-sm text-slate-600 space-y-1 md:col-span-2">
              Logo URL
              <input
                value={settings.brand.logoUrl}
                onChange={(e) => setSettings({ ...settings, brand: { ...settings.brand, logoUrl: e.target.value } })}
                placeholder="https://cdn.evw.pk/logo.png"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
          <header className="flex items-center gap-2">
            <CloudUpload className="text-emerald-600" size={18} />
            <div>
              <h3 className="font-semibold text-slate-800">Backups</h3>
              <p className="text-xs text-slate-500">Local toggle for cloud readiness</p>
            </div>
          </header>
          <div className="space-y-2 text-sm">
            <label className="flex items-center justify-between">
              <span>Daily backups</span>
              <input
                type="checkbox"
                checked={settings.backups.dailyBackups}
                onChange={(e) => setSettings({ ...settings, backups: { ...settings.backups, dailyBackups: e.target.checked } })}
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Retention (days)</span>
              <input
                type="number"
                min={1}
                value={settings.backups.retentionDays}
                onChange={(e) => setSettings({ ...settings, backups: { ...settings.backups, retentionDays: Number(e.target.value) } })}
                className="w-24 rounded-lg border border-slate-200 px-2 py-1"
              />
            </label>
            <label className="text-xs text-slate-500">Notify</label>
            <input
              value={settings.backups.notifyEmail}
              onChange={(e) => setSettings({ ...settings, backups: { ...settings.backups, notifyEmail: e.target.value } })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
            <div className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs p-3 flex items-center gap-2">
              <Sparkles size={14} />
              Ready for nightly encrypted backups.
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3 lg:col-span-2">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="text-emerald-600" size={18} />
              <h3 className="font-semibold text-slate-800">Bank & PKR invoice details</h3>
            </div>
            <span className="text-xs text-slate-500">Visible on invoices + WhatsApp</span>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-600 space-y-1">
              Bank name
              <input
                value={settings.banking.bankName}
                onChange={(e) => setSettings({ ...settings, banking: { ...settings.banking, bankName: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600 space-y-1">
              Account title
              <input
                value={settings.banking.accountTitle}
                onChange={(e) => setSettings({ ...settings, banking: { ...settings.banking, accountTitle: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600 space-y-1">
              Account number
              <input
                value={settings.banking.accountNumber}
                onChange={(e) => setSettings({ ...settings, banking: { ...settings.banking, accountNumber: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600 space-y-1">
              IBAN (optional)
              <input
                value={settings.banking.iban ?? ''}
                onChange={(e) => setSettings({ ...settings, banking: { ...settings.banking, iban: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.invoice.showBankOnInvoice}
                onChange={(e) => setSettings({ ...settings, invoice: { ...settings.invoice, showBankOnInvoice: e.target.checked } })}
              />
              Show bank box on invoices
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.invoice.showQrOnInvoice}
                onChange={(e) => setSettings({ ...settings, invoice: { ...settings.invoice, showQrOnInvoice: e.target.checked } })}
              />
              Show QR/WhatsApp tile
            </label>
            <label className="text-sm text-slate-600 space-y-1 md:col-span-2">
              WhatsApp footer
              <input
                value={settings.invoice.whatsappFooter}
                onChange={(e) => setSettings({ ...settings, invoice: { ...settings.invoice, whatsappFooter: e.target.value } })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <header className="flex items-center gap-2">
            <MessageCircle className="text-emerald-600" size={18} />
            <div>
              <h3 className="font-semibold text-slate-800">WhatsApp broadcast</h3>
              <p className="text-xs text-slate-500">Share payment instructions with team</p>
            </div>
          </header>
          <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 whitespace-pre-line">
            {whatsappTemplate}
          </div>
          <div className="flex gap-2">
            <a
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-2 text-sm font-semibold"
              href={`https://wa.me/?text=${encodeURIComponent(whatsappTemplate)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> Send to WhatsApp
            </a>
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              <Copy size={16} /> Copy
            </button>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow"
        >
          <Save size={18} /> Save settings
        </button>
        <button
          onClick={() => setSettings(StorageService.getSettings())}
          className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl border border-slate-200"
        >
          <RefreshCw size={18} /> Reset to saved
        </button>
        {saved && <span className="text-sm text-emerald-700 font-semibold">Saved locally ✔</span>}
      </div>
    </div>
  );
};

export default Settings;
