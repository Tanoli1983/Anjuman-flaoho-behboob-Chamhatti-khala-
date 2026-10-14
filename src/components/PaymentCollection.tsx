import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PaymentCategory, PaymentMethod, PaymentRecord } from '../types';
import {
  ReceiptText,
  User,
  PlusCircle,
  Edit2,
  Trash2,
  Printer,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface PaymentCollectionProps {
  initialMemberId?: string;
  onPaymentSuccess?: () => void;
}

export const PaymentCollection: React.FC<PaymentCollectionProps> = ({
  initialMemberId,
}) => {
  const { state, language, isAdmin, addPayment, updatePayment, deletePayment, setLatestReceipt, getMemberSummary } = useApp();
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'record' | 'history' | 'annual_emergency'>('record');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialMemberId || state.members[0]?.id || ''
  );
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>('monthly');
  const [amountReceived, setAmountReceived] = useState<number>(100);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [relevantPeriod, setRelevantPeriod] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  // Search & Filter in Payment History
  const [historySearch, setHistorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Edit / Delete State
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  // Annual Emergency Contribution Form State
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear().toString());
  const [annualDeathsCount, setAnnualDeathsCount] = useState<number>(6);
  const [annualRatePerDeath, setAnnualRatePerDeath] = useState<number>(state.settings.emergencyFee || 100);
  const [annualMemberId, setAnnualMemberId] = useState(state.members[0]?.id || '');
  const [annualSuccessMsg, setAnnualSuccessMsg] = useState<string | null>(null);

  // Category auto-amount suggestion
  const handleCategoryChange = (cat: PaymentCategory) => {
    setPaymentCategory(cat);
    if (cat === 'registration') {
      setAmountReceived(state.settings.registrationFee || 200);
    } else if (cat === 'monthly') {
      setAmountReceived(state.settings.monthlyFee || 100);
    } else if (cat === 'emergency') {
      setAmountReceived(state.settings.emergencyFee || 100);
    } else if (cat === 'annual_emergency') {
      setAmountReceived((state.settings.emergencyFee || 100) * 6);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || amountReceived <= 0) return;

    addPayment({
      memberId: selectedMemberId,
      amountReceived,
      paymentCategory,
      paymentMethod,
      date: paymentDate,
      relevantPeriod,
      notes,
    });

    setNotes('');
    setActiveSubTab('history');
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    updatePayment(editingPayment.id, {
      amountReceived: Math.round(editingPayment.amountReceived),
      date: editingPayment.date,
      paymentCategory: editingPayment.paymentCategory,
      paymentMethod: editingPayment.paymentMethod,
      relevantPeriod: editingPayment.relevantPeriod,
      notes: editingPayment.notes,
    });

    setEditingPayment(null);
  };

  const handleDeletePayment = (id: string) => {
    deletePayment(id);
    setDeletingPaymentId(null);
  };

  const handleRecordAnnualEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = annualDeathsCount * annualRatePerDeath;
    const mem = state.members.find(m => m.id === annualMemberId);
    if (!mem) return;

    addPayment({
      memberId: mem.id,
      amountReceived: totalAmount,
      paymentCategory: 'annual_emergency',
      paymentMethod: 'cash',
      date: new Date().toISOString().substring(0, 10),
      relevantPeriod: annualYear,
      notes: `Annual emergency contribution for Year ${annualYear} (${annualDeathsCount} deaths × Rs. ${annualRatePerDeath} = Rs. ${totalAmount})`,
    });

    setAnnualSuccessMsg(`Recorded Annual Emergency Contribution of Rs. ${totalAmount} for ${mem.fullName}!`);
    setTimeout(() => setAnnualSuccessMsg(null), 5000);
  };

  const filteredPayments = (state.payments || []).filter((p) => {
    const q = historySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.memberName.toLowerCase().includes(q) ||
      p.memberId.toLowerCase().includes(q) ||
      p.receiptNumber.toLowerCase().includes(q) ||
      p.notes.toLowerCase().includes(q);

    const matchesCat = categoryFilter === 'all' || p.paymentCategory === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const selectedMember = state.members.find(m => m.id === selectedMemberId);
  const selectedMemberSummary = selectedMember ? getMemberSummary(selectedMember.id) : null;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            فیس و ادائیگیوں کا انتظام (Payment & Fee Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add, edit, update, and delete individual member fees, emergency funds, and registration payments
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('record')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'record' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Record Payment (نئی وصولی)
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'history' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment History ({state.payments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('annual_emergency')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'annual_emergency' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual Emergency Fund
          </button>
        </div>
      </div>

      {/* VIEW 1: RECORD PAYMENT FORM */}
      {activeSubTab === 'record' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-emerald-700" />
              <span>Record Member Fee Payment</span>
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs sm:text-sm">
              {/* Member Selection */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Select Member / ممبر منتخب کریں *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  {state.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} — {m.fullName} s/o {m.fatherName} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Category */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Fee Category / فیس کی مد *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('monthly')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'monthly'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="block text-xs">Monthly Fee</span>
                    <span className="text-[11px] font-normal">Rs. {state.settings.monthlyFee || 100}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('emergency')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'emergency'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="block text-xs">Emergency Fee</span>
                    <span className="text-[11px] font-normal">Rs. {state.settings.emergencyFee || 100}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('registration')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'registration'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="block text-xs">Registration Fee</span>
                    <span className="text-[11px] font-normal">Rs. {state.settings.registrationFee || 200}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('donation')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'donation'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="block text-xs">General Donation</span>
                    <span className="text-[11px] font-normal">عطیہ / امداد</span>
                  </button>
                </div>
              </div>

              {/* Amount, Date, Period, Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Amount Received (PKR / روپے) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-slate-900 text-base focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Relevant Month / Period
                  </label>
                  <input
                    type="month"
                    value={relevantPeriod}
                    onChange={(e) => setRelevantPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="cash">Cash (نقد کیش)</option>
                    <option value="bank_transfer">Bank Transfer (بینک ٹرانسفر)</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Payment Reference / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. October monthly fee paid in cash / Receipt reference"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={amountReceived <= 0}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md text-sm sm:text-base cursor-pointer transition flex items-center justify-center gap-2"
              >
                <ReceiptText className="w-5 h-5" />
                <span>Save Payment & Generate Official Receipt</span>
              </button>
            </form>
          </div>

          {/* Member Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                <span>Selected Member Snapshot</span>
              </h3>

              {selectedMember && (
                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {selectedMember.id}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {selectedMember.fullName}
                    </h4>
                    <p className="text-slate-500">ولد: {selectedMember.fatherName}</p>
                    <p className="text-slate-500 font-mono mt-0.5">{selectedMember.mobile}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Payments Recorded:</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(selectedMemberSummary?.totalPaid || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Obligations Due:</span>
                      <span className="font-bold">
                        {formatCurrency(selectedMemberSummary?.totalDue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-600 font-semibold">Remaining Balance:</span>
                      <span className="font-bold text-amber-700">
                        {formatCurrency(selectedMemberSummary?.totalBalance || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center mt-4 pt-3 border-t border-slate-100">
              Receipt prefix: {state.settings.receiptPrefix}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PAYMENT HISTORY (WITH EDIT & DELETE) */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by member name, ID, receipt #, or remarks..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="monthly">Monthly Fee (ماہانہ فیس)</option>
              <option value="emergency">Emergency Fee (کفن دفن فنڈ)</option>
              <option value="annual_emergency">Annual Emergency</option>
              <option value="registration">Registration Fee (داخلہ فیس)</option>
              <option value="donation">Donations (عطیات)</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Date</th>
                    <th className="py-2.5 px-3 sm:px-4">Receipt #</th>
                    <th className="py-2.5 px-3 sm:px-4">Member</th>
                    <th className="py-2.5 px-3 sm:px-4">Category</th>
                    <th className="py-2.5 px-3 sm:px-4">Period</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Amount (PKR)</th>
                    <th className="py-2.5 px-3 sm:px-4 text-center">Mode</th>
                    <th className="py-2.5 px-3 sm:px-4 text-center no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap font-mono text-slate-600">
                        {formatDate(pay.date)}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-slate-900">
                        {pay.receiptNumber}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-800">
                        {pay.memberName} <span className="text-slate-400 font-mono text-xs">({pay.memberId})</span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            pay.paymentCategory === 'monthly'
                              ? 'bg-blue-100 text-blue-800'
                              : pay.paymentCategory === 'emergency' || pay.paymentCategory === 'annual_emergency'
                              ? 'bg-purple-100 text-purple-800'
                              : pay.paymentCategory === 'registration'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pay.paymentCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-500 text-xs">
                        {pay.relevantPeriod || '-'}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                        {formatCurrency(pay.amountReceived)}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center uppercase text-xs font-semibold text-slate-600">
                        {pay.paymentMethod}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setLatestReceipt(pay)}
                            title="View / Print Receipt"
                            className="p-1 text-slate-500 hover:text-emerald-700 rounded hover:bg-emerald-50"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => setEditingPayment(pay)}
                                title="Edit Payment"
                                className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingPaymentId(pay.id)}
                                title="Delete Payment"
                                className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
                No payment transactions recorded yet. All old sample payments were cleared as requested.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: BULK ANNUAL EMERGENCY CONTRIBUTION */}
      {activeSubTab === 'annual_emergency' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
            <ReceiptText className="w-5 h-5 text-purple-700" />
            <h3 className="font-bold text-slate-900 text-base">
              Annual Emergency Contribution (سالانہ کفن دفن فنڈ)
            </h3>
          </div>

          <p className="text-xs text-slate-600 mb-4">
            Record bulk annual emergency / kafan-dafan contributions against a specific year with calculation details (e.g. 6 deaths × Rs. 100 = Rs. 600 per member).
          </p>

          {annualSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{annualSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleRecordAnnualEmergency} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Member / ممبر منتخب کریں *
              </label>
              <select
                value={annualMemberId}
                onChange={(e) => setAnnualMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                {state.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.fullName} s/o {m.fatherName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Year / سال</label>
                <input
                  type="number"
                  value={annualYear}
                  onChange={(e) => setAnnualYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Deaths</label>
                <input
                  type="number"
                  min="1"
                  value={annualDeathsCount}
                  onChange={(e) => setAnnualDeathsCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rate per Death (PKR)</label>
                <input
                  type="number"
                  value={annualRatePerDeath}
                  onChange={(e) => setAnnualRatePerDeath(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-purple-950 font-bold">
              <span>Total Annual Obligation:</span>
              <span className="text-base text-purple-900">
                {formatCurrency(annualDeathsCount * annualRatePerDeath)} ({annualDeathsCount} deaths × Rs. {annualRatePerDeath})
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
            >
              Record Annual Contribution
            </button>
          </form>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Payment Record ({editingPayment.receiptNumber})
              </h3>
              <button
                onClick={() => setEditingPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingPayment.amountReceived}
                    onChange={(e) => setEditingPayment({ ...editingPayment, amountReceived: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingPayment.date}
                    onChange={(e) => setEditingPayment({ ...editingPayment, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingPayment.paymentCategory}
                    onChange={(e) => setEditingPayment({ ...editingPayment, paymentCategory: e.target.value as PaymentCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="monthly">Monthly Fee</option>
                    <option value="emergency">Emergency Fee</option>
                    <option value="annual_emergency">Annual Emergency</option>
                    <option value="registration">Registration Fee</option>
                    <option value="donation">Donation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period (Month/Year)</label>
                  <input
                    type="text"
                    value={editingPayment.relevantPeriod || ''}
                    onChange={(e) => setEditingPayment({ ...editingPayment, relevantPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Notes</label>
                <input
                  type="text"
                  value={editingPayment.notes}
                  onChange={(e) => setEditingPayment({ ...editingPayment, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
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

      {/* Delete Payment Modal */}
      {deletingPaymentId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Confirm Payment Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this payment record? The received amount will be deducted from financial totals and the member's paid balance.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeletingPaymentId(null)}
                className="px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePayment(deletingPaymentId)}
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
