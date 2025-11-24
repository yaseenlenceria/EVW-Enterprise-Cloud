import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  PieChart, 
  Menu, 
  X,
  Settings,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout, userName, userRole }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'pos', label: 'POS / Sale', icon: ShoppingCart },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: PieChart },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-wider text-emerald-400">EVW</h1>
            <span className="text-xs text-slate-400">Enterprise Cloud</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-400 hover:text-white cursor-pointer px-4 py-2">
            <div className="flex items-center">
              <Settings size={18} className="mr-2" />
              <span>Settings</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={!onLogout}
            className="w-full flex items-center justify-between text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg disabled:opacity-60"
          >
            <span className="flex items-center">
              <LogOut size={18} className="mr-2" />
              Log out
            </span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{userName ? userName.split(' ')[0] : 'User'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 lg:hidden hover:bg-gray-100 rounded"
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden lg:flex items-center text-slate-500 text-sm">
             <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">Online</span>
             {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{userName ?? 'Admin User'}</p>
              <p className="text-xs text-slate-500">{userRole ?? 'Manager'}</p>
            </div>
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow">
              {(userName ?? 'EVW').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
