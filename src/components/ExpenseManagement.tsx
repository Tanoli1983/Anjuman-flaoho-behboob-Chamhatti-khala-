import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ExpenseRecord, PaymentMethod } from '../types';
import {
  TrendingDown,
  PlusCircle,
  Search,
  FileSpreadsheet,
  Printer,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const ExpenseManagement: React.FC = () => {
  const { state, language, isAdmin, addExpense, updateExpense, deleteExpense } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [category, setCategory] = useState('Dar-ul-Baqa 2 cemetery');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidTo, setPaidTo] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [receiptAttachment, setReceiptAttachment] = useState('');
  const [notes, setNotes] = useState('');

  const categories = [
    'Dar-ul-Baqa 2 cemetery',
    'Cemetery maintenance',
    'Construction and repair',
    'Funeral transport / ambulance',
    'Administrative expenses',
    'Emergency family relief',
    'Karachi office expenses',
    'Other welfare',
  ];

  // Authoritative total calculated dynamically from stored records
  const validExpenses = useMemo(() => {
    return (state.expenses || []).filter((e) => e.status !== 'reversed');
  }, [state.expenses]);

  const totalValidExpensesSum = useMemo(() => {
    return validExpenses.reduce((sum, e) => sum + Math.round(e.amount), 0);
  }, [validExpenses]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return (state.expenses || []).filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        e.description.toLowerCase().includes(q) ||
        e.paidTo.toLowerCase().includes(q) ||
        e.voucherNumber.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [state.expenses, searchQuery, categoryFilter]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    addExpense({
      title: title.trim() || description.trim(),
      date,
      category,
      description,
      amount,
      paymentMethod,
      paidTo,
      voucherNumber: voucherNumber || `VOUCH-${Date.now().toString().slice(-4)}`,
      receiptAttachment,
      notes,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setAmount(1000);
    setPaidTo('');
    setVoucherNumber('');
    setReceiptAttachment('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    updateExpense(editingExpense.id, {
      title: editingExpense.title,
      date: editingExpense.date,
      category: editingExpense.category,
      description: editingExpense.description,
      amount: Math.round(editingExpense.amount),
      paymentMethod: editingExpense.paymentMethod,
      paidTo: editingExpense.paidTo,
      voucherNumber: editingExpense.voucherNumber,
      receiptAttachment: editingExpense.receiptAttachment,
      notes: editingExpense.notes,
    });

    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    setDeletingExpenseId(null);
  };

  const handleExportCsv = () => {
    const headers = ['Expense ID', 'Title', 'Date', 'Category', 'Description', 'Amount (PKR)', 'Paid To', 'Voucher #'];
    const rows = state.expenses.map((e) => [
      `"${e.id}"`,
      `"${e.title || e.description}"`,
      `"${e.date}"`,
      `"${e.category}"`,
      `"${e.description}"`,
      e.amount,
      `"${e.paidTo}"`,
      `"${e.voucherNumber}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `AFB_Karachi_Expenses_${new Date().toISOString().substring(0, 10)}.csv`);
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
            اخراجات کا مکمل انتظام (Expense Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add, edit, and delete association expenditures with authoritative database totals
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
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Authoritative Expense Total Card */}
      <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Total Valid Expenses (کل خرچہ)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-700">
              {formatCurrency(totalValidExpensesSum)}
            </div>
          </div>
        </div>

        <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-100 text-xs text-rose-950 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            Calculated dynamically from saved database transactions: e.g. Rs. 28,500 + Rs. 31,200 + Rs. 20,000 = Rs. 79,700.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, payee, voucher #..."
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
          <option value="all">All Categories (تمام مدات)</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Date</th>
                <th className="py-2.5 px-3 sm:px-4">Category</th>
                <th className="py-2.5 px-3 sm:px-4">Description / Title</th>
                <th className="py-2.5 px-3 sm:px-4">Paid To</th>
                <th className="py-2.5 px-3 sm:px-4">Voucher #</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Amount (PKR)</th>
                {isAdmin && <th className="py-2.5 px-3 sm:px-4 text-center no-print">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap font-mono text-slate-600">
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {exp.category}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-700 max-w-xs">
                    <span className="font-semibold block text-slate-900">{exp.title || exp.description}</span>
                    <span className="text-xs text-slate-500">{exp.description}</span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-medium text-slate-900 whitespace-nowrap">
                    {exp.paidTo}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-500 text-xs">
                    {exp.voucherNumber}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right font-extrabold text-rose-700 whitespace-nowrap">
                    {formatCurrency(exp.amount)}
                  </td>
                  {isAdmin && (
                    <td className="py-2.5 px-3 sm:px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingExpense(exp)}
                          title="Edit Expense"
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingExpenseId(exp.id)}
                          title="Delete Expense"
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
                  Total Valid Expenses / کل اخراجات:
                </td>
                <td className="py-3 px-3 sm:px-4 text-right text-rose-700 text-base">
                  {formatCurrency(totalValidExpensesSum)}
                </td>
                {isAdmin && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
            No expenses recorded yet. All old sample expenses were removed as requested.
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Record New Expense / نیا خرچہ
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expense Title / عنوان *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dar-ul-Baqa Cemetery Main Gate Repair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

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
                  Description / تفصیلی بیان *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mistri charges and materials purchased"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount (PKR / روپے) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid To *</label>
                  <input
                    type="text"
                    required
                    placeholder="Vendor / Payee Name"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Voucher #</label>
                  <input
                    type="text"
                    placeholder="e.g. VOUCH-01"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
                  Receipt / Supporting Document Ref
                </label>
                <input
                  type="text"
                  placeholder="Receipt number or invoice reference"
                  value={receiptAttachment}
                  onChange={(e) => setReceiptAttachment(e.target.value)}
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
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Expense ({editingExpense.voucherNumber})
              </h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingExpense.title || editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Paid To *</label>
                <input
                  type="text"
                  required
                  value={editingExpense.paidTo}
                  onChange={(e) => setEditingExpense({ ...editingExpense, paidTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 bg-slate-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Modal */}
      {deletingExpenseId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Confirm Expense Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this expense voucher? It will be removed from database totals and balance calculations immediately.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExpense(deletingExpenseId)}
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
