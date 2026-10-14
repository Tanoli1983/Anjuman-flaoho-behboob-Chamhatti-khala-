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
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const IncomeManagement: React.FC = () => {
  const { state, language, isAdmin, addIncome, updateIncome, deleteIncome } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);

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
    return (state.incomes || []).filter((i) => i.status !== 'reversed');
  }, [state.incomes]);

  const totalIncomeSum = useMemo(() => {
    return validIncomes.reduce((sum, i) => sum + Math.round(i.amount), 0);
  }, [validIncomes]);

  const filteredIncomes = useMemo(() => {
    return (state.incomes || []).filter((i) => {
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

  const handleUpdateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;

    updateIncome(editingIncome.id, {
      date: editingIncome.date,
      category: editingIncome.category,
      receivedFrom: editingIncome.receivedFrom,
      description: editingIncome.description,
      amount: Math.round(editingIncome.amount),
      paymentMethod: editingIncome.paymentMethod,
      receiptNumber: editingIncome.receiptNumber,
      notes: editingIncome.notes,
    });

    setEditingIncome(null);
  };

  const handleDeleteIncome = (id: string) => {
    deleteIncome(id);
    setDeletingIncomeId(null);
  };

  const handleExportCsv = () => {
    const headers = ['Income ID', 'Date', 'Category', 'Description', 'Amount (PKR)', 'Received From', 'Receipt #'];
    const rows = state.incomes.map((i) => [
      `"${i.id}"`,
      `"${i.date}"`,
      `"${i.category}"`,
      `"${i.description}"`,
      i.amount,
      `"${i.receivedFrom}"`,
      `"${i.receiptNumber}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `AFB_Karachi_Donations_${new Date().toISOString().substring(0, 10)}.csv`);
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
            عطیات و دیگر آمدن (Donations & General Income)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add, edit, and delete welfare donations, community grants, and non-fee income
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
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Donation</span>
            </button>
          )}
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
                {isAdmin && <th className="py-2.5 px-3 sm:px-4 text-center no-print">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition">
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
                  {isAdmin && (
                    <td className="py-2.5 px-3 sm:px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingIncome(inc)}
                          title="Edit Income"
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingIncomeId(inc.id)}
                          title="Delete Income"
                          className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
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
                {isAdmin && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {filteredIncomes.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
            No donations recorded yet. All old sample donations were removed as requested.
          </div>
        )}
      </div>

      {/* Add Income Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Record New Donation / Income
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
                  placeholder="e.g. Cemetery water supply development grant"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

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
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Income Modal */}
      {editingIncome && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Donation / Income Record
              </h3>
              <button
                onClick={() => setEditingIncome(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateIncome} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingIncome.amount}
                    onChange={(e) => setEditingIncome({ ...editingIncome, amount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingIncome.date}
                    onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Received From *</label>
                <input
                  type="text"
                  required
                  value={editingIncome.receivedFrom}
                  onChange={(e) => setEditingIncome({ ...editingIncome, receivedFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={editingIncome.description}
                  onChange={(e) => setEditingIncome({ ...editingIncome, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingIncome(null)}
                  className="px-4 py-2 bg-slate-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Income Modal */}
      {deletingIncomeId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Confirm Donation Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this donation record? It will be permanently deducted from total income and available cash balance.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeletingIncomeId(null)}
                className="px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteIncome(deletingIncomeId)}
                className="px-4 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
