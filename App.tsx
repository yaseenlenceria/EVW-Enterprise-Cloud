
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { Expenses } from './components/Expenses';
import { Invoice } from './types';
import { StorageService } from './services/storage';
import { InvoiceView } from './components/InvoiceView';
import { CustomerList } from './components/CustomerList';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

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
      case 'expenses': return <Expenses />;
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
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {StorageService.getInvoices().map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono">{inv.id}</td>
                                <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{inv.customerName}</td>
                                <td className="px-6 py-4 font-medium">Rs. {inv.total.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => setViewInvoice(inv)} 
                                        className="text-emerald-600 hover:underline"
                                    >
                                        View
                                    </button>
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

  return (
    <Layout activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setViewInvoice(null); }}>
      {renderContent()}
    </Layout>
  );
}
