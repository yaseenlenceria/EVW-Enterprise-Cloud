import React from 'react';
import { MessageCircle, Banknote, QrCode } from 'lucide-react';
import { Invoice } from '../types';
import { COMPANY_DETAILS } from '../constants';

// WhatsApp Share Helper
export const generateWhatsAppLink = (invoice: Invoice) => {
  const text = [
    `*INVOICE FROM ${COMPANY_DETAILS.name}*`,
    `Invoice #: ${invoice.id}`,
    `Date: ${new Date(invoice.date).toLocaleDateString()}`,
    `Customer: ${invoice.customerName}`,
    `Total: Rs. ${invoice.total.toLocaleString()} (PKR)`,
    `Payment: ${invoice.paymentMethod}`,
    '',
    `Bank: ${COMPANY_DETAILS.bankDetails.bankName}`,
    `Title: ${COMPANY_DETAILS.bankDetails.accountTitle}`,
    `AC#: ${COMPANY_DETAILS.bankDetails.accountNumber}`,
    '',
    'Thank you for choosing EVW.',
  ].join('\n');

  return `https://wa.me/${invoice.customerId === 'c2' ? '923215555555' : ''}?text=${encodeURIComponent(text)}`;
};

export const InvoiceView: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  return (
    <div className="bg-white p-8 md:p-10 w-full text-slate-800 text-sm border border-emerald-50 shadow-2xl rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-lg shadow-lg">EV</div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase">EVW Enterprise Cloud</p>
            <h1 className="text-2xl font-bold text-slate-900">{COMPANY_DETAILS.name}</h1>
            <p className="text-slate-500 text-xs mt-1">{COMPANY_DETAILS.address}</p>
            <p className="text-slate-500 text-xs">{COMPANY_DETAILS.phone} · {COMPANY_DETAILS.email}</p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Invoice</p>
              <p className="text-xl font-bold text-slate-900">#{invoice.id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {invoice.status}
            </div>
          </div>
          <p className="text-xs text-slate-500">{new Date(invoice.date).toLocaleString('en-PK')}</p>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
            <Banknote size={14} /> Payment: {invoice.paymentMethod}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
          <p className="font-bold text-lg">{invoice.customerName}</p>
          <p className="text-slate-500 text-sm">PKR pricing · Vape industry ready</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <QrCode className="text-emerald-500" />
          <div>
            <p className="text-xs text-slate-500">WhatsApp ready</p>
            <a
              href={generateWhatsAppLink(invoice)}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 font-semibold text-sm inline-flex items-center gap-1"
            >
              <MessageCircle size={14} /> Share invoice
            </a>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-8 rounded-xl overflow-hidden border border-slate-100">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
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
                <span className="block font-semibold text-slate-900">{item.name}</span>
                <span className="text-xs text-slate-400">{item.brand} · {item.strength}</span>
              </td>
              <td className="py-3 px-4 text-center">{item.quantity}</td>
              <td className="py-3 px-4 text-right">Rs. {item.appliedPrice.toLocaleString()}</td>
              <td className="py-3 px-4 text-right font-semibold">Rs. {(item.appliedPrice * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer / Totals */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
         <div className="md:w-1/2">
            <h4 className="font-bold text-slate-700 mb-2">Payment Details</h4>
            <div className="text-xs text-slate-500 space-y-1">
               <p>Bank: {COMPANY_DETAILS.bankDetails.bankName}</p>
               <p>Title: {COMPANY_DETAILS.bankDetails.accountTitle}</p>
               <p>AC#: {COMPANY_DETAILS.bankDetails.accountNumber}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <a
                href={generateWhatsAppLink(invoice)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full text-xs font-semibold shadow"
              >
                <MessageCircle size={14} /> Send via WhatsApp
              </a>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full text-xs font-semibold"
              >
                Print / Save PDF
              </button>
            </div>
         </div>

         <div className="w-full md:w-64 space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between text-slate-500 text-sm">
               <span>Subtotal</span>
               <span>Rs. {invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 text-sm">
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

      <div className="mt-12 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
         <p className="font-semibold text-slate-700">Thank you for choosing EVW.</p>
         <p>EVW-branded invoice · PKR ready · WhatsApp share built-in</p>
      </div>
    </div>
  );
};
