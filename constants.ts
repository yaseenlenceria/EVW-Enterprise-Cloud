import { Product, Customer, Expense, Invoice } from './types';

export const COMPANY_DETAILS = {
  name: 'EVW VAPE WHOLESALE',
  address: 'Shop 12, Techno City Mall, Karachi, Pakistan',
  phone: '+92 300 1234567',
  email: 'sales@evw-pakistan.com',
  bankDetails: {
    bankName: 'Meezan Bank',
    accountTitle: 'EVW Traders',
    accountNumber: 'PK12 MEZN 0000 1234 5678 9012',
  },
  logoPlaceholder: 'https://via.placeholder.com/150x50?text=EVW+Logo',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'VGod Cubano Black',
    sku: 'VG-CUB-BLK-50',
    brand: 'VGod',
    category: 'Nic Salt',
    flavor: 'Tobacco Custard',
    strength: '50mg',
    costPrice: 2800,
    wholesalePrice: 3200,
    retailPrice: 4000,
    stock: 45,
    lowStockThreshold: 10,
    description: 'Rich creamy tobacco flavor.',
  },
  {
    id: '2',
    name: 'Pod Salt Nexus Pro',
    sku: 'PS-NEX-MAN',
    brand: 'Pod Salt',
    category: 'Disposable',
    flavor: 'Mango Ice',
    strength: '20mg',
    costPrice: 1500,
    wholesalePrice: 1800,
    retailPrice: 2500,
    stock: 8,
    lowStockThreshold: 15,
  },
  {
    id: '3',
    name: 'Tokyo Iced Mint',
    sku: 'TOK-MINT-30',
    brand: 'Tokyo',
    category: 'E-Liquid',
    flavor: 'Mint',
    strength: '3mg',
    costPrice: 2200,
    wholesalePrice: 2600,
    retailPrice: 3500,
    stock: 120,
    lowStockThreshold: 20,
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Walk-in Customer',
    phone: '',
    type: 'RETAIL',
    balance: 0,
    creditLimit: 0,
    tags: [],
  },
  {
    id: 'c2',
    name: 'Vape Station Lahore',
    phone: '+92 321 5555555',
    type: 'WHOLESALE',
    balance: 15000,
    creditLimit: 50000,
    tags: ['Distributor', 'Reliable'],
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    date: new Date().toISOString(),
    category: 'Rent',
    amount: 50000,
    description: 'Shop Rent - October',
    paymentMethod: 'BANK',
  },
];

export const INITIAL_INVOICES: Invoice[] = [];

export const CATEGORIES = ['E-Liquid', 'Nic Salt', 'Disposable', 'Device', 'Pod', 'Coil', 'Accessory'];
export const BRANDS = ['VGod', 'Tokyo', 'Pod Salt', 'Juice Head', 'Skwezed', 'GeekVape', 'Vaporesso', 'Uwell'];
