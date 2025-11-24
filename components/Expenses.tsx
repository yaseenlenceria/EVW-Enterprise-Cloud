
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Tag, Trash2, PieChart } from 'lucide-react';
import { Expense } from '../types';
import { StorageService } from '../services/storage';

const CATEGORIES = ['Rent', 'Utilities', 'Salary', 'Restocking', 'Maintenance', 'Marketing', 'Other'];

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH'
  });

  useEffect(() => {
    setExpenses(StorageService.getExpenses());
  }, []);

  const handleSave = () => {
    if (!newExpense.amount || !newExpense.category) return;

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      date: newExpense.date || new Date().toISOString(),
      category: newExpense.category as any,
      amount: Number(newExpense.amount),
      description: newExpense.description || '',
      paymentMethod: newExpense.paymentMethod as any || 'CASH'
    };

    StorageService.addExpense(expense);
    setExpenses(StorageService.getExpenses());
    setModalOpen(false);
    setNewExpense({ date: new Date().toISOString().split('T')[0], paymentMethod: 'CASH' });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate totals by category
  const byCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(byCategory).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Expense Tracker</h2>
          <p className="text-slate-500">Manage your business spending.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="mt-4 md:mt-0 flex items-center bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg shadow transition-all"
        >
          <Plus size={18} className="mr-2" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-4 rounded-full bg-rose-50 text-rose-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Expenses</p>
            <h3 className="text-2xl font-bold text-slate-800">Rs. {totalExpenses.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 mr-4">
            <PieChart size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Top Spending</p>
            <h3 className="text-xl font-bold text-slate-800">{topCategory ? topCategory[0] : '-'}</h3>
            <p className="text-xs text-slate-400">{topCategory ? `Rs. ${topCategory[1].toLocaleString()}` : ''}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mr-4">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Current Month</p>
            <h3 className="text-xl font-bold text-slate-800">October</h3>
            <p className="text-xs text-slate-400">FY 2024-25</p>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(expense => (
              <tr key={expense.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700 border border-slate-200">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4">{expense.description}</td>
                <td className="px-6 py-4 text-xs uppercase font-medium text-slate-500">{expense.paymentMethod}</td>
                <td className="px-6 py-4 text-right font-bold text-rose-600">Rs. {expense.amount.toLocaleString()}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">No expenses recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Add Expense</h3>
              <button onClick={() => setModalOpen(false)}><span className="text-2xl">&times;</span></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full p-2 border rounded bg-white"
                  value={newExpense.category || ''}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                  value={newExpense.amount || ''}
                  onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded"
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Shop Rent October"
                  value={newExpense.description || ''}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                 <div className="flex space-x-2">
                    {['CASH', 'BANK', 'OTHER'].map(m => (
                        <button 
                            key={m}
                            onClick={() => setNewExpense({...newExpense, paymentMethod: m as any})}
                            className={`flex-1 py-2 text-xs font-bold rounded border ${newExpense.paymentMethod === m ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-500 border-slate-200'}`}
                        >
                            {m}
                        </button>
                    ))}
                 </div>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end space-x-3 rounded-b-xl">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded shadow font-medium"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
