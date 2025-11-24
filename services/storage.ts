
import { Product, Customer, Invoice, Expense, StockLog } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_EXPENSES, INITIAL_INVOICES } from '../constants';

const KEYS = {
  PRODUCTS: 'evw_products',
  CUSTOMERS: 'evw_customers',
  INVOICES: 'evw_invoices',
  EXPENSES: 'evw_expenses',
  STOCK_LOGS: 'evw_stock_logs',
};

// Helper to load or initialize
const load = <T,>(key: string, defaults: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaults;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaults;
  }
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const StorageService = {
  getProducts: () => load<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (products: Product[]) => save(KEYS.PRODUCTS, products),

  getCustomers: () => load<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  saveCustomers: (customers: Customer[]) => save(KEYS.CUSTOMERS, customers),

  getInvoices: () => load<Invoice[]>(KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoices: (invoices: Invoice[]) => save(KEYS.INVOICES, invoices),

  getExpenses: () => load<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES),
  saveExpenses: (expenses: Expense[]) => save(KEYS.EXPENSES, expenses),

  getStockLogs: () => load<StockLog[]>(KEYS.STOCK_LOGS, []),
  
  addExpense: (expense: Expense) => {
    const expenses = StorageService.getExpenses();
    expenses.unshift(expense);
    save(KEYS.EXPENSES, expenses);
  },

  // Business Logic Simulations
  addInvoice: (invoice: Invoice) => {
    const invoices = StorageService.getInvoices();
    const products = StorageService.getProducts();
    const customers = StorageService.getCustomers();

    // 1. Save Invoice
    invoices.unshift(invoice);
    save(KEYS.INVOICES, invoices);

    // 2. Deduct Stock
    const newProducts = products.map(p => {
      const soldItem = invoice.items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    });
    save(KEYS.PRODUCTS, newProducts);

    // 3. Update Customer Balance (if not paid fully)
    if (invoice.status !== 'PAID' && invoice.customerId) {
        const remaining = invoice.total; // Assuming full amount credited for simplicity in this mvp
        const newCustomers = customers.map(c => {
            if (c.id === invoice.customerId) {
                return { ...c, balance: c.balance + remaining };
            }
            return c;
        });
        save(KEYS.CUSTOMERS, newCustomers);
    }
  },

  adjustStock: (productId: string, newStock: number, reason: StockLog['reason'], notes?: string) => {
    const products = StorageService.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const diff = newStock - product.stock;
    
    // Update Product
    const updatedProducts = products.map(p => p.id === productId ? { ...p, stock: newStock } : p);
    save(KEYS.PRODUCTS, updatedProducts);

    // Add Log
    const logs = StorageService.getStockLogs();
    const newLog: StockLog = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      changeAmount: diff,
      reason,
      date: new Date().toISOString(),
      notes
    };
    logs.unshift(newLog);
    save(KEYS.STOCK_LOGS, logs);
  }
};
