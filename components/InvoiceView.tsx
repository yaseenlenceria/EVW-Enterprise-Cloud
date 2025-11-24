import React from 'react';
import { Invoice } from '../types';
import { COMPANY_DETAILS } from '../constants';

// WhatsApp Share Helper
const generateWhatsAppLink = (invoice: Invoice) => {
    const text = `*INVOICE FROM ${COMPANY_DETAILS.name}*
Invoice #: ${invoice.id}
Date: ${new Date(invoice.date).toLocaleDateString()}
Total: Rs. ${invoice.total.toLocaleString()}

Please pay to:
${COMPANY_DETAILS.bankDetails.bankName}
${COMPANY_DETAILS.bankDetails.accountNumber}

Thank you for your business!`;
    return `https://wa.me/${invoice.customerId === 'c2' ? '923215555555' : ''}?text=${encodeURIComponent(text)}`;
};

export const InvoiceView: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  return (
    <div className="bg-white p-8 md:p-10 w-full text-slate-800 text-sm">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
        <div>
           <h1 className="text-2xl font-bold text-emerald-600 uppercase tracking-widest">{COMPANY_DETAILS.name}</h1>
           <p className="mt-1 text-slate-500 w-64">{COMPANY_DETAILS.address}</p>
           <p className="text-slate-500">{COMPANY_DETAILS.phone}</p>
           <p className="text-slate-500">{COMPANY_DETAILS.email}</p>
        </div>
        <div className="text-right">
           <h2 className="text-3xl font-light text-slate-300">INVOICE</h2>
           <p className="font-bold text-slate-700 mt-2">#{invoice.id}</p>
           <p className="text-slate-500">{new Date(invoice.date).toLocaleDateString()}</p>
           <div className="mt-4">
              <span className={`px-3 py-1 rounded text-xs font-bold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {invoice.status}
              </span>
           </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
        <p className="font-bold text-lg">{invoice.customerName}</p>
        <p className="text-slate-500">Payment: {invoice.paymentMethod}</p>
      </div>

      {/* Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-slate-100 border-y border-slate-200 text-slate-600">
            <th className="py-3 px-4 text-left font-semibold">Description</th>
            <th className="py-3 px-4 text-center font-semibold">Qty</th>
            <th className="py-3 px-4 text-right font-semibold">Price</th>
            <th className="py-3 px-4 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-50">
              <td className="py-3 px-4">
                <span className="block font-medium">{item.name}</span>
                <span className="text-xs text-slate-400">{item.brand} - {item.strength}</span>
              </td>
              <td className="py-3 px-4 text-center">{item.quantity}</td>
              <td className="py-3 px-4 text-right">Rs. {item.appliedPrice.toLocaleString()}</td>
              <td className="py-3 px-4 text-right font-medium">Rs. {(item.appliedPrice * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer / Totals */}
      <div className="flex flex-col md:flex-row justify-between items-start">
         <div className="mb-6 md:mb-0">
            <h4 className="font-bold text-slate-700 mb-2">Payment Details</h4>
            <div className="text-xs text-slate-500">
               <p>Bank: {COMPANY_DETAILS.bankDetails.bankName}</p>
               <p>Title: {COMPANY_DETAILS.bankDetails.accountTitle}</p>
               <p>AC#: {COMPANY_DETAILS.bankDetails.accountNumber}</p>
            </div>
            
            <a 
                href={generateWhatsAppLink(invoice)}
                target="_blank" 
                rel="noreferrer"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-800 font-bold text-xs print:hidden"
            >
                Share on WhatsApp
            </a>
         </div>

         <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-slate-500">
               <span>Subtotal</span>
               <span>Rs. {invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
                <div className="flex justify-between text-green-600">
                   <span>Discount</span>
                   <span>- Rs. {invoice.discount.toLocaleString()}</span>
                </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-xl pt-4 border-t border-slate-200">
               <span>Total</span>
               <span>Rs. {invoice.total.toLocaleString()}</span>
            </div>
         </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
         <p>Thank you for choosing EVW.</p>
         <p>Software Powered by EVW Cloud</p>
      </div>
    </div>
  );
};
