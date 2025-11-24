
import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { Expenses } from './components/Expenses';
import { Invoice } from './types';
import { StorageService } from './services/storage';
import { InvoiceView, generateWhatsAppLink } from './components/InvoiceView';
import { CustomerList } from './components/CustomerList';
import { LoginScreen } from './components/Login';
import { Team } from './components/Team';
import { Settings } from './components/Settings';
import { UserProfile } from './types';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('evw:activeTab') || 'dashboard');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const savedUser = StorageService.getUserProfile();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    StorageService.saveUserProfile(profile);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('evw:activeTab', activeTab);
    }
  }, [activeTab, user]);

  const handleLogout = () => {
    setUser(null);
    StorageService.saveUserProfile(null);
  };

  const renderContent = () => {
    // If viewing a specific invoice details
    if (viewInvoice) {
        return (
            <div>
                <button onClick={() => setViewInvoice(null)} className="mb-4 text-emerald-600 underline">← Back to Invoices</button>
                <div className="max-w-3xl mx-auto shadow-lg">
                    <InvoiceView invoice={viewInvoice} />
                </div>
            </div>
        )
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'pos': return <POS />;
      case 'customers': return <CustomerList />;
      case 'settings': return <Settings user={user} />;
      case 'expenses': return <Expenses />;
      case 'users': return <Team />;
      case 'invoices': return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Invoice History</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 font-semibold border-b">
                        <tr>
                            <th className="px-6 py-4">Inv #</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {StorageService.getInvoices().map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono">{inv.id}</td>
                                <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{inv.customerName}</td>
                                <td className="px-6 py-4 font-medium">Rs. {inv.total.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                      onClick={() => setViewInvoice(inv)}
                                      className="text-emerald-600 hover:underline font-semibold"
                                    >
                                      View
                                    </button>
                                    <a
                                      href={generateWhatsAppLink(inv)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-700 hover:text-emerald-800 font-semibold"
                                    >
                                      WhatsApp
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {StorageService.getInvoices().length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-slate-400">No invoices generated yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(t) => {
        setActiveTab(t);
        setViewInvoice(null);
      }}
      onLogout={handleLogout}
      userName={user.name}
      userRole={user.role}
    >
      {renderContent()}
    </Layout>
  );
}
