import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate, amountToWordsUrdu, amountToWordsEnglish } from '../utils/formatters';
import { PaymentRecord } from '../types';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  receipt: PaymentRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const { state, language, getMemberSummary } = useApp();
  const t = translations[language];

  if (!receipt) return null;

  const member = state.members.find(m => m.id === receipt.memberId);
  const memberSummary = member ? getMemberSummary(member.id) : null;
  const remainingBalance = memberSummary ? memberSummary.totalBalance : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*${state.settings.orgName}*
*${state.settings.orgNameUrdu}*
------------------------------
*OFFICIAL PAYMENT RECEIPT / فیس رسید*
Receipt No: ${receipt.receiptNumber}
Date: ${formatDate(receipt.date)}
Member: ${receipt.memberName} (ID: ${receipt.memberId})
Father's Name: ${member?.fatherName || '-'}
------------------------------
*Allocations:*
${receipt.allocations.map(a => `• ${a.title}: PKR ${a.amount.toLocaleString()}`).join('\n')}
------------------------------
*Total Received: PKR ${receipt.amountReceived.toLocaleString()}*
*Remaining Balance: PKR ${remainingBalance.toLocaleString()}*
Payment Mode: ${receipt.paymentMethod.toUpperCase()}
Recorded by: ${receipt.recordedBy}
Thank you for your valuable contribution!
جزاکم اللہ خیراً`;

    const encoded = encodeURIComponent(text);
    const url = member?.mobile 
      ? `https://api.whatsapp.com/send?phone=${member.mobile.replace(/[^0-9]/g, '')}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Controls (Hidden in Print) */}
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800 text-sm">Official Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.common.print}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 print-container" id="printable-receipt">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-emerald-800">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full uppercase tracking-wider mb-1">
              Official Payment Voucher / رسید فیس
            </div>
            <h2 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-tight">
              {state.settings.orgName}
            </h2>
            <h3 className="text-base font-bold text-emerald-800 font-urdu mt-0.5">
              {state.settings.orgNameUrdu}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {state.settings.address} • Phone: {state.settings.phone}
            </p>
          </div>

          {/* Receipt Info Bar */}
          <div className="grid grid-cols-2 gap-2 py-3 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Receipt No: </span>
              <span className="font-bold text-slate-900 font-mono">{receipt.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Date: </span>
              <span className="font-bold text-slate-900">{formatDate(receipt.date)}</span>
            </div>
          </div>

          {/* Member Details */}
          <div className="bg-slate-50 rounded-lg p-3 my-3 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-600">Member ID / آئی ڈی:</span>
              <span className="font-bold text-slate-900 font-mono">{receipt.memberId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Full Name / نام:</span>
              <span className="font-bold text-slate-900 text-sm">{receipt.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Father's Name / ولدیت:</span>
              <span className="font-semibold text-slate-800">{member?.fatherName || '-'}</span>
            </div>
            {member?.mobile && (
              <div className="flex justify-between">
                <span className="text-slate-600">Mobile / فون:</span>
                <span className="text-slate-700">{member.mobile}</span>
              </div>
            )}
          </div>

          {/* Allocations Table */}
          <div className="my-3 border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-emerald-800 text-white">
                <tr>
                  <th className="py-2 px-3 text-left">Description / مد فیس</th>
                  <th className="py-2 px-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receipt.allocations.map((alloc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-800 font-medium">
                      {alloc.title}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(alloc.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                <tr>
                  <td className="py-2 px-3 text-slate-900">Total Received / کل وصولی:</td>
                  <td className="py-2 px-3 text-right text-emerald-700 text-sm">
                    {formatCurrency(receipt.amountReceived)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in words */}
          <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs space-y-1">
            <div className="text-slate-700">
              <span className="font-semibold">In Words: </span>
              <span className="italic">{amountToWordsEnglish(receipt.amountReceived)}</span>
            </div>
            <div className="text-emerald-900 font-urdu text-right text-sm">
              <span className="font-bold">رقم بلحاظ الفاظ: </span>
              <span>{amountToWordsUrdu(receipt.amountReceived)}</span>
            </div>
          </div>

          {/* Balance & Payment Mode */}
          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 text-xs mt-2">
            <div>
              <span className="text-slate-500">Mode: </span>
              <span className="font-semibold uppercase text-slate-800">{receipt.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-500">Remaining Balance: </span>
              <span className={`font-bold ${remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formatCurrency(remainingBalance)}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-4 text-center text-xs text-slate-600">
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                Treasurer / خزانچی
              </div>
              <p className="text-[10px] text-slate-400">Signature & Stamp</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                General Secretary / صدر
              </div>
              <p className="text-[10px] text-slate-400">Authorized Office-Bearer</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
