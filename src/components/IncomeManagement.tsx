import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { IncomeRecord, PaymentMethod } from '../types';
import {
  BadgeDollarSign,
  PlusCircle,
  Search,
  FileSpreadsheet,
  Printer,
  X,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const IncomeManagement: React.FC = () => {
  const { state, language, addIncome, reverseIncome } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reversingIncome, setReversingIncome] = useState<IncomeRecord | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [category, setCategory] = useState('General Donation');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receivedFrom, setReceivedFrom] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const categories = [
    'General Donation',
    'Overseas Welfare Grant',
    'Zakat / Sadqah Welfare',
    'Cemetery Improvement Fund',
    'Special Community Contribution',
    'Other Income',
  ];

  const validIncomes = useMemo(() => {
    return state.incomes.filter((i) => i.status !== 'reversed');
  }, [state.incomes]);

  const totalIncomeSum = useMemo(() => {
    return validIncomes.reduce((sum, i) => sum + Math.round(i.amount), 0);
  }, [validIncomes]);

  const filteredIncomes = useMemo(() => {
    return state.incomes.filter((i) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        i.description.toLowerCase().includes(q) ||
        i.receivedFrom.toLowerCase().includes(q) ||
        i.receiptNumber.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || i.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [state.incomes, searchQuery, categoryFilter]);

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0 || !receivedFrom.trim()) return;

    addIncome({
      date,
      category,
      description,
      amount,
      paymentMethod,
      receivedFrom,
      receiptNumber: receiptNumber || `DON-${Date.now().toString().slice(-4)}`,
      notes,
    });

    setDescription('');
    setAmount(5000);
    setReceivedFrom('');
    setReceiptNumber('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleConfirmReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingIncome || !reversalReason.trim()) return;
    reverseIncome(reversingIncome.id, reversalReason.trim());
    setReversingIncome(null);
    setReversalReason('');
  };

  const handleExportCsv = () => {
    const headers = ['Income ID', 'Date', 'Category', 'Description', 'Amount (PKR)', 'Received From', 'Receipt #', 'Status'];
    const rows = state.incomes.map((i) => [
      `"${i.id}"`,
      `"${i.date}"`,
      `"${i.category}"`,
      `"${i.description}"`,
      i.amount,
      `"${i.receivedFrom}"`,
      `"${i.receiptNumber}"`,
      `"${i.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `AFB_General_Income_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.income.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.income.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.income.addIncome}</span>
          </button>
        </div>
      </div>

      {/* Metric Card */}
      <div className="bg-white rounded-xl border border-teal-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-100 text-teal-700 rounded-xl shrink-0">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Total Valid Donations & Grants (عام عطیات)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-teal-700">
              {formatCurrency(totalIncomeSum)}
            </div>
          </div>
        </div>

        <div className="bg-teal-50/70 p-3 rounded-lg border border-teal-100 text-xs text-teal-950 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Separate from member monthly dues and death welfare fund collections.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search donor name, receipt #, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white font-medium text-slate-700"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Date</th>
                <th className="py-2.5 px-3 sm:px-4">Category</th>
                <th className="py-2.5 px-3 sm:px-4">Received From (Donor)</th>
                <th className="py-2.5 px-3 sm:px-4">Description</th>
                <th className="py-2.5 px-3 sm:px-4">Receipt #</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Amount (PKR)</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncomes.map((inc) => (
                <tr key={inc.id} className={`hover:bg-slate-50 transition ${inc.status === 'reversed' ? 'opacity-50 line-through bg-slate-50' : ''}`}>
                  <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap font-mono text-slate-600">
                    {formatDate(inc.date)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {inc.category}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-900 whitespace-nowrap">
                    {inc.receivedFrom}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-700 max-w-xs truncate">
                    {inc.description}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-500 text-xs">
                    {inc.receiptNumber}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right font-extrabold text-teal-700 whitespace-nowrap">
                    {formatCurrency(inc.amount)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        inc.status === 'reversed' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center no-print">
                    {inc.status !== 'reversed' && (
                      <button
                        onClick={() => setReversingIncome(inc)}
                        title="Auditable Reversal"
                        className="p-1 text-slate-400 hover:text-red-700 rounded hover:bg-red-50 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={5} className="py-3 px-3 sm:px-4 text-slate-800">
                  Total Valid Other Income:
                </td>
                <td className="py-3 px-3 sm:px-4 text-right text-teal-700 text-base">
                  {formatCurrency(totalIncomeSum)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Income Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {t.income.addIncome}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncome} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Received From (Donor / Contributor) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overseas Chamhatti Forum UK / Well-wisher"
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="cash">Cash (نقد)</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="jazzcash">JazzCash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cemetery water tank development grant"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Receipt / Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. DON-2026-03"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Restricted or general welfare"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-md"
                >
                  Record Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {reversingIncome && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">
              Reverse Income Record ({reversingIncome.receiptNumber})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reversing will auditably deduct PKR {formatCurrency(reversingIncome.amount)} from valid income without deleting the historical audit trail.
            </p>

            <form onSubmit={handleConfirmReversal} className="mt-4 space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reversal Reason (Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Entered incorrect donor amount"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReversingIncome(null)}
                  className="px-3 py-1.5 bg-slate-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
