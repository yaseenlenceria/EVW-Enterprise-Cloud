import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Wallet, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { DashboardStats, Product, Invoice } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const products = StorageService.getProducts();
    const invoices = StorageService.getInvoices();
    const expenses = StorageService.getExpenses();

    // Calculate Stats
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalProfit = invoices.reduce((sum, inv) => sum + inv.profit, 0);
    const totalExpensesVal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

    setStats({
      totalRevenue,
      totalProfit,
      totalExpenses: totalExpensesVal,
      netIncome: totalProfit - totalExpensesVal,
      lowStockCount
    });

    // Mock Sales Data for Chart (Last 7 days) - In real app, aggregate from invoices
    const data = [
      { name: 'Mon', sales: 40000 },
      { name: 'Tue', sales: 30000 },
      { name: 'Wed', sales: 55000 },
      { name: 'Thu', sales: 48000 },
      { name: 'Fri', sales: 70000 },
      { name: 'Sat', sales: 90000 },
      { name: 'Sun', sales: 65000 },
    ];
    setSalesData(data);
  }, []);

  const handleGetInsights = async () => {
    if (!stats) return;
    setLoadingInsight(true);
    const products = StorageService.getProducts();
    const sorted = [...products].sort((a, b) => b.stock - a.stock); // Simple proxy for top moving
    const topNames = sorted.slice(0, 3).map(p => p.name);
    
    const text = await GeminiService.getBusinessInsights(stats, topNames);
    setInsight(text);
    setLoadingInsight(false);
  };

  if (!stats) return <div>Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
          <p className="text-slate-500">Welcome back to EVW Cloud.</p>
        </div>
        <button 
          onClick={handleGetInsights}
          disabled={loadingInsight}
          className="mt-4 md:mt-0 flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition-all disabled:opacity-50"
        >
          <Sparkles size={18} className="mr-2" />
          {loadingInsight ? 'Analyzing...' : 'AI Business Insights'}
        </button>
      </div>

      {insight && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-indigo-900 flex items-center mb-2">
            <Sparkles size={16} className="mr-2 text-indigo-600" />
            Gemini Analysis
          </h4>
          <div className="text-indigo-800 text-sm whitespace-pre-line">{insight}</div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Net Profit" 
          value={`Rs. ${stats.totalProfit.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Expenses" 
          value={`Rs. ${stats.totalExpenses.toLocaleString()}`} 
          icon={Wallet} 
          color="bg-rose-500" 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStockCount.toString()} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Weekly Sales Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Top Categories</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                {name: 'E-Liquid', value: 45},
                {name: 'Disposables', value: 30},
                {name: 'Pods', value: 15},
                {name: 'Devices', value: 10},
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string, icon: any, color: string}> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
    <div className={`p-4 rounded-full ${color} bg-opacity-10 mr-4`}>
      <Icon className={`text-${color.replace('bg-', '')}`} size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);
