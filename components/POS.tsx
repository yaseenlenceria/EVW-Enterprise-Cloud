import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, User, Printer, CheckCircle } from 'lucide-react';
import { Product, Customer, CartItem, Invoice } from '../types';
import { StorageService } from '../services/storage';
import { InvoiceView } from './InvoiceView';

export const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [priceType, setPriceType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('CASH');
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    setProducts(StorageService.getProducts());
    setCustomers(StorageService.getCustomers());
    setSelectedCustomer(StorageService.getCustomers()[0]); // Default to first (Walk-in)
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    const appliedPrice = priceType === 'WHOLESALE' ? product.wholesalePrice : product.retailPrice;

    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, priceType, appliedPrice }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.appliedPrice * item.quantity), 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  
  // Simple discount logic for demo
  const discount = selectedCustomer?.type === 'DISTRIBUTOR' ? subtotal * 0.05 : 0; 
  const total = subtotal - discount;
  const profit = total - totalCost;

  const handleCheckout = () => {
    if (!selectedCustomer || cart.length === 0) return;

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: cart,
      subtotal,
      discount,
      tax: 0, // Simplified
      total,
      profit,
      status: 'PAID',
      paymentMethod,
    };

    StorageService.addInvoice(newInvoice);
    setCompletedInvoice(newInvoice);
    // Reset
    setCart([]);
  };

  if (completedInvoice) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 print:hidden">
                <div className="flex items-center text-emerald-600 font-bold text-xl">
                    <CheckCircle className="mr-2" /> Sale Completed!
                </div>
                <div>
                     <button 
                        onClick={() => window.print()} 
                        className="bg-slate-800 text-white px-4 py-2 rounded mr-2 hover:bg-slate-700"
                    >
                        <Printer size={18} className="inline mr-2" /> Print Invoice
                    </button>
                    <button 
                        onClick={() => setCompletedInvoice(null)} 
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        New Sale
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-gray-50 overflow-auto p-4 flex justify-center">
                <div className="bg-white shadow-lg p-0 max-w-2xl w-full">
                    <InvoiceView invoice={completedInvoice} />
                </div>
            </div>
        </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Scan Barcode or Search Product..." 
              className="pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full bg-slate-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
             <button onClick={() => setSearch('')} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium hover:bg-slate-200">All</button>
             <button onClick={() => setSearch('Disposable')} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium hover:bg-slate-200">Disposables</button>
             <button onClick={() => setSearch('Liquid')} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium hover:bg-slate-200">E-Liquids</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className="border border-slate-100 rounded-lg p-3 hover:shadow-md cursor-pointer transition-shadow bg-white flex flex-col justify-between h-32"
            >
              <div>
                <h4 className="font-medium text-slate-800 line-clamp-2 text-sm">{product.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{product.brand}</p>
              </div>
              <div className="flex justify-between items-end mt-2">
                 <div>
                    <span className="block text-xs text-slate-400">Stock: {product.stock}</span>
                    <span className="font-bold text-emerald-600">Rs. {priceType === 'RETAIL' ? product.retailPrice : product.wholesalePrice}</span>
                 </div>
                 <button className="bg-emerald-50 text-emerald-600 p-1 rounded hover:bg-emerald-100">
                    <Plus size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart / Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
        {/* Customer Select */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Customer</label>
                <button className="text-emerald-600 text-xs font-medium">+ New</button>
            </div>
            <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <select 
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white"
                    value={selectedCustomer?.id}
                    onChange={(e) => {
                        const cust = customers.find(c => c.id === e.target.value);
                        setSelectedCustomer(cust || null);
                        setPriceType(cust?.type === 'WHOLESALE' || cust?.type === 'DISTRIBUTOR' ? 'WHOLESALE' : 'RETAIL');
                    }}
                >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                </select>
            </div>
            <div className="flex gap-2 mt-3">
                <button 
                    onClick={() => setPriceType('RETAIL')}
                    className={`flex-1 text-xs py-1 rounded border ${priceType === 'RETAIL' ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-slate-200'}`}
                >Retail Price</button>
                <button 
                    onClick={() => setPriceType('WHOLESALE')}
                    className={`flex-1 text-xs py-1 rounded border ${priceType === 'WHOLESALE' ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-slate-200'}`}
                >Wholesale Price</button>
            </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCartIcon />
                <p className="mt-2 text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center group">
                <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">Rs. {item.appliedPrice} x {item.quantity}</div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-slate-600 border rounded"><Minus size={12} /></button>
                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-slate-600 border rounded"><Plus size={12} /></button>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-600 ml-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>- Rs. {discount.toLocaleString()}</span>
                </div>
            )}
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
                {['CASH', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA'].map((m) => (
                    <button 
                        key={m}
                        onClick={() => setPaymentMethod(m as any)}
                        className={`text-xs font-bold py-2 rounded border ${paymentMethod === m ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300'}`}
                    >
                        {m.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-bold shadow-lg transition-colors flex justify-center items-center"
            >
                Checkout <span className="ml-2 font-normal">(Rs. {total.toLocaleString()})</span>
            </button>
        </div>
      </div>
    </div>
  );
};

const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
