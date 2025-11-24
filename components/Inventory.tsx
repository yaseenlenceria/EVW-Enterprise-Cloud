
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, ClipboardCheck, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { BRANDS, CATEGORIES } from '../constants';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  
  // Product Editing State
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});
  const [aiLoading, setAiLoading] = useState(false);

  // Stock Adjustment State
  const [auditProduct, setAuditProduct] = useState<Product | null>(null);
  const [auditNewStock, setAuditNewStock] = useState<string>('');
  const [auditReason, setAuditReason] = useState<string>('CORRECTION');
  const [auditNotes, setAuditNotes] = useState('');

  useEffect(() => {
    setProducts(StorageService.getProducts());
  }, []);

  const handleSave = () => {
    let updatedProducts = [...products];
    if (editProduct.id) {
      // Edit
      updatedProducts = updatedProducts.map(p => p.id === editProduct.id ? editProduct as Product : p);
    } else {
      // Add
      const newProduct: Product = {
        ...editProduct,
        id: Math.random().toString(36).substr(2, 9),
        stock: editProduct.stock || 0,
      } as Product;
      updatedProducts.unshift(newProduct);
    }
    setProducts(updatedProducts);
    StorageService.saveProducts(updatedProducts);
    setModalOpen(false);
    setEditProduct({});
  };

  const handleAuditSave = () => {
    if (!auditProduct || auditNewStock === '') return;
    const newStockVal = parseInt(auditNewStock);
    if (isNaN(newStockVal)) return;

    StorageService.adjustStock(auditProduct.id, newStockVal, auditReason as any, auditNotes);
    
    // Refresh
    setProducts(StorageService.getProducts());
    setAuditModalOpen(false);
    setAuditProduct(null);
    setAuditNewStock('');
  };

  const openAudit = (product: Product) => {
    setAuditProduct(product);
    setAuditNewStock(product.stock.toString());
    setAuditReason('CORRECTION');
    setAuditNotes('');
    setAuditModalOpen(true);
  };

  const handleAiDescription = async () => {
    if (!editProduct.name || !editProduct.category) return;
    setAiLoading(true);
    const desc = await GeminiService.generateProductDescription(editProduct);
    setEditProduct(prev => ({ ...prev, description: desc }));
    setAiLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Inventory Management</h2>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search SKU or Name..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditProduct({}); setModalOpen(true); }}
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <Plus size={18} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">SKU / Brand</th>
                <th className="px-6 py-4">Cost Price</th>
                <th className="px-6 py-4">Retail Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-500">{product.flavor} • {product.strength}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded inline-block">{product.sku}</div>
                    <div className="text-xs mt-1">{product.brand}</div>
                  </td>
                  <td className="px-6 py-4">Rs. {product.costPrice}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">Rs. {product.retailPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock <= product.lowStockThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {product.stock} Units
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <button 
                      onClick={() => { setEditProduct(product); setModalOpen(true); }}
                      className="text-indigo-600 hover:text-indigo-800 mr-3 flex items-center"
                      title="Edit Product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => openAudit(product)}
                      className="text-amber-600 hover:text-amber-800 flex items-center"
                      title="Adjust Stock / Audit"
                    >
                      <ClipboardCheck size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{editProduct.id ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setModalOpen(false)}><span className="text-2xl">&times;</span></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={editProduct.name || ''}
                  onChange={e => setEditProduct({...editProduct, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Barcode)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={editProduct.sku || ''}
                  onChange={e => setEditProduct({...editProduct, sku: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={editProduct.brand || ''}
                  onChange={e => setEditProduct({...editProduct, brand: e.target.value})}
                >
                    <option value="">Select Brand</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Flavor</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={editProduct.flavor || ''}
                  onChange={e => setEditProduct({...editProduct, flavor: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={editProduct.category || ''}
                  onChange={e => setEditProduct({...editProduct, category: e.target.value})}
                >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (Rs)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={editProduct.costPrice || 0}
                  onChange={e => setEditProduct({...editProduct, costPrice: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wholesale Price (Rs)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={editProduct.wholesalePrice || 0}
                  onChange={e => setEditProduct({...editProduct, wholesalePrice: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Retail Price (Rs)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={editProduct.retailPrice || 0}
                  onChange={e => setEditProduct({...editProduct, retailPrice: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Level</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={editProduct.stock || 0}
                  onChange={e => setEditProduct({...editProduct, stock: Number(e.target.value)})}
                />
              </div>

              <div className="col-span-2">
                 <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <button 
                        onClick={handleAiDescription}
                        disabled={aiLoading}
                        className="text-xs text-indigo-600 flex items-center hover:underline disabled:opacity-50"
                    >
                        <Sparkles size={12} className="mr-1" />
                        {aiLoading ? 'Generating...' : 'Auto-Generate with AI'}
                    </button>
                 </div>
                 <textarea 
                    className="w-full p-2 border rounded h-20"
                    value={editProduct.description || ''}
                    onChange={e => setEditProduct({...editProduct, description: e.target.value})}
                 />
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
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow font-medium"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit / Adjust Modal */}
      {isAuditModalOpen && auditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
             <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Adjust Stock</h3>
                <p className="text-sm text-slate-500">Audit for: {auditProduct.name}</p>
             </div>
             <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-3 rounded text-center">
                    <span className="text-xs uppercase text-slate-400 font-bold">Current System Stock</span>
                    <div className="text-3xl font-bold text-slate-800">{auditProduct.stock}</div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Stock Count (Actual)</label>
                    <input 
                        type="number" 
                        className="w-full p-3 border rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-amber-500"
                        value={auditNewStock}
                        onChange={e => setAuditNewStock(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-1 text-center">Enter the physical count.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Adjustment</label>
                    <select 
                        className="w-full p-2 border rounded"
                        value={auditReason}
                        onChange={e => setAuditReason(e.target.value)}
                    >
                        <option value="CORRECTION">Stock Count Correction</option>
                        <option value="RESTOCK">New Shipment (Restock)</option>
                        <option value="DAMAGE">Damaged / Expired</option>
                        <option value="THEFT">Theft / Missing</option>
                        <option value="RETURN">Customer Return</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea 
                        className="w-full p-2 border rounded h-20"
                        placeholder="Optional notes for audit log..."
                        value={auditNotes}
                        onChange={e => setAuditNotes(e.target.value)}
                    />
                </div>
             </div>
             <div className="p-6 border-t bg-slate-50 flex justify-end space-x-3 rounded-b-xl">
                <button 
                    onClick={() => setAuditModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleAuditSave}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded shadow font-medium"
                >
                    Confirm Adjustment
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
