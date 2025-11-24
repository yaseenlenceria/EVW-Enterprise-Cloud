import React from 'react';
import { Customer } from '../types';
import { StorageService } from '../services/storage';

export const CustomerList: React.FC = () => {
    const customers = StorageService.getCustomers();

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Customers & Credit</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 font-semibold border-b">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Balance (Receivable)</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {customers.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs">{c.type}</span>
                                </td>
                                <td className="px-6 py-4">{c.phone || '-'}</td>
                                <td className={`px-6 py-4 font-bold ${c.balance > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                    Rs. {c.balance.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    {c.balance > 0 ? (
                                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Payment Due</span>
                                    ) : (
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Clear</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}