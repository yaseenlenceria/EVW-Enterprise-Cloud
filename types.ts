
export type Product = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  flavor: string;
  strength: string; // e.g., '3mg', '50mg'
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  lowStockThreshold: number;
  description?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  type: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  balance: number; // Positive means they owe us
  creditLimit: number;
  tags: string[];
  notes?: string;
};

export type CartItem = Product & {
  quantity: number;
  priceType: 'RETAIL' | 'WHOLESALE';
  appliedPrice: number;
};

export type Invoice = {
  id: string;
  customerName: string;
  customerId?: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA';
  notes?: string;
};

export type Expense = {
  id: string;
  date: string;
  category: 'Rent' | 'Utilities' | 'Salary' | 'Restocking' | 'Maintenance' | 'Marketing' | 'Other';
  amount: number;
  description: string;
  paymentMethod: 'CASH' | 'BANK' | 'OTHER';
};

export type StockLog = {
  id: string;
  productId: string;
  productName: string;
  changeAmount: number; // +5 or -2
  reason: 'RESTOCK' | 'SALE' | 'DAMAGE' | 'THEFT' | 'CORRECTION' | 'RETURN';
  date: string;
  notes?: string;
};

export type DashboardStats = {
  totalRevenue: number;
  totalProfit: number;
  totalExpenses: number;
  netIncome: number;
  lowStockCount: number;
};
