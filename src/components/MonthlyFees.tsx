import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatMonthYear, formatMonthYearUrdu } from '../utils/formatters';
import { PaymentMethod } from '../types';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  ReceiptText,
  FileSpreadsheet,
  Printer,
  X,
  Sparkles,
} from 'lucide-react';

export const MonthlyFees: React.FC<{ onSelectMemberForPayment: (memberId: string) => void }> = ({
  onSelectMemberForPayment,
}) => {
  const { state, language, generateMonthlyFees, recordBulkMonthlyPayment, setLatestReceipt } = useApp();
  const t = translations[language];

  // Current month default (e.g. "2026-10")
  const defaultMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'warn'; msg: string } | null>(null);

  // Bulk Payment Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkAmount, setBulkAmount] = useState<number>(state.settings.monthlyFee || 100);
  const [bulkMethod, setBulkMethod] = useState<PaymentMethod>('cash');

  // Month-wise member breakdown
  const monthlyData = useMemo(() => {
    const feeRate = state.settings.monthlyFee || 100;
    const eligibleMembers = state.members.filter(
      (m) => m.status === 'active' && m.joiningMonth <= selectedMonth
    );

    let totalDue = 0;
    let totalCollected = 0;

    const list = eligibleMembers.map((member) => {
      const obl = state.obligations.find(
        (o) => o.memberId === member.id && o.type === 'monthly' && o.periodMonth === selectedMonth
      );

      const directPayment = state.payments.find(
        (p) =>
          p.memberId === member.id &&
          p.status !== 'reversed' &&
          (p.allocations?.some((a) => a.periodMonth === selectedMonth && a.type === 'monthly') ||
            ((p.paymentCategory === 'monthly' || p.paymentCategory === 'annual_monthly') &&
              p.relevantPeriod?.includes(selectedMonth)))
      );

      const due = obl ? obl.amountDue : feeRate;
      const paid = obl ? obl.amountPaid : directPayment ? feeRate : 0;
      const status = obl ? obl.status : directPayment ? 'paid' : 'unpaid';

      totalDue += due;
      totalCollected += paid;

      return {
        member,
        obligation: obl,
        due,
        paid,
        balance: Math.max(0, due - paid),
        status,
      };
    });

    const filtered = list.filter((item) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'paid') return item.status === 'paid';
      if (statusFilter === 'unpaid') return item.status === 'unpaid';
      if (statusFilter === 'partial') return item.status === 'partial';
      return true;
    });

    return {
      eligibleCount: eligibleMembers.length,
      totalDue,
      totalCollected,
      outstanding: Math.max(0, totalDue - totalCollected),
      items: filtered,
      allItems: list,
    };
  }, [state.members, state.obligations, selectedMonth, statusFilter, state.settings.monthlyFee]);

  const handleGenerateFees = () => {
    const result = generateMonthlyFees(selectedMonth);
    if (result.createdCount > 0) {
      setNotification({
        type: 'success',
        msg: `Successfully generated PKR ${state.settings.monthlyFee || 100} fee obligations for ${result.createdCount} eligible active members! (${result.skippedCount} already existed or joined after ${selectedMonth}).`,
      });
    } else {
      setNotification({
        type: 'warn',
        msg: `Monthly fees for ${formatMonthYear(selectedMonth)} are already fully generated! Duplicates are strictly blocked.`,
      });
    }
    setTimeout(() => setNotification(null), 6000);
  };

  const handleExecuteBulkPayment = () => {
    if (selectedMemberIds.length === 0) return;
    const res = recordBulkMonthlyPayment(selectedMemberIds, selectedMonth, bulkAmount, bulkMethod);
    setNotification({
      type: 'success',
      msg: `Recorded bulk collection of PKR ${bulkAmount * res.paymentCount} for ${res.paymentCount} members!`,
    });
    setIsBulkModalOpen(false);
    setSelectedMemberIds([]);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSelectAllUnpaid = () => {
    const unpaids = monthlyData.allItems
      .filter((i) => i.status !== 'paid')
      .map((i) => i.member.id);
    setSelectedMemberIds(unpaids);
  };

  const handleExportCsv = () => {
    const headers = ['Member ID', 'Member Name', "Father's Name", 'Month', 'Due (PKR)', 'Paid (PKR)', 'Balance (PKR)', 'Status'];
    const rows = monthlyData.items.map((i) => [
      `"${i.member.id}"`,
      `"${i.member.fullName}"`,
      `"${i.member.fatherName}"`,
      `"${selectedMonth}"`,
      i.due,
      i.paid,
      i.balance,
      `"${i.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Monthly_Fee_${selectedMonth}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.monthly.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.monthly.subtitle} (PKR {state.settings.monthlyFee || 100} / Month)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => {
              handleSelectAllUnpaid();
              setIsBulkModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <ReceiptText className="w-4 h-4" />
            <span>{t.monthly.bulkCollect}</span>
          </button>
          <button
            onClick={handleGenerateFees}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.monthly.generateFees}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Month Selector & KPI Cards */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-700" />
            <label className="text-xs sm:text-sm font-bold text-slate-800">
              Select Month / مہینہ:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Filter Status:</span>
            <div className="flex gap-1">
              {(['all', 'paid', 'unpaid', 'partial'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Month Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">Eligible Active Members</span>
            <span className="text-lg font-bold text-slate-800 block mt-0.5">
              {monthlyData.eligibleCount} Members
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">{t.monthly.monthTotalDue}</span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {formatCurrency(monthlyData.totalDue)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-700 block font-medium">{t.monthly.monthTotalCollected}</span>
            <span className="text-lg font-bold text-emerald-800 block mt-0.5">
              {formatCurrency(monthlyData.totalCollected)}
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-[11px] text-amber-700 block font-medium">{t.monthly.monthOutstanding}</span>
            <span className="text-lg font-bold text-amber-800 block mt-0.5">
              {formatCurrency(monthlyData.outstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Member Monthly Fee Collection Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {formatMonthYear(selectedMonth)} Collection Sheet ({formatMonthYearUrdu(selectedMonth)})
          </span>
          <span className="text-xs text-slate-500">
            Showing {monthlyData.items.length} of {monthlyData.allItems.length} members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">ID</th>
                <th className="py-2.5 px-3 sm:px-4">Member Name</th>
                <th className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">Father's Name</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Fee Due</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Paid</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Balance</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.items.map(({ member, due, paid, balance, status }) => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-slate-700">
                    {member.id}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-900">
                    {member.fullName}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-600 hidden sm:table-cell">
                    {member.fatherName}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right font-medium text-slate-800">
                    {formatCurrency(due)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right font-bold text-emerald-700">
                    {formatCurrency(paid)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right font-bold text-amber-700">
                    {balance > 0 ? formatCurrency(balance) : '0'}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'partial'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-center no-print">
                    {status !== 'paid' ? (
                      <button
                        onClick={() => onSelectMemberForPayment(member.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        Collect PKR {due}
                      </button>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Fee Collection Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {t.monthly.bulkCollect} ({formatMonthYear(selectedMonth)})
                </h3>
                <p className="text-xs text-slate-500">
                  Select village members who contributed their monthly cash dues
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs sm:text-sm overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount per Member (PKR)
                  </label>
                  <input
                    type="number"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={bulkMethod}
                    onChange={(e) => setBulkMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="cash">Cash (نقد)</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="jazzcash">JazzCash</option>
                  </select>
                </div>
              </div>

              {/* Members selection list */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-700">
                    Select Members ({selectedMemberIds.length} Selected)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllUnpaid}
                      className="text-xs text-emerald-700 hover:underline font-semibold"
                    >
                      Select All Unpaid
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds([])}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 p-1">
                  {monthlyData.allItems.map(({ member, due, status }) => {
                    const isChecked = selectedMemberIds.includes(member.id);
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-emerald-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberIds([...selectedMemberIds, member.id]);
                              } else {
                                setSelectedMemberIds(selectedMemberIds.filter((id) => id !== member.id));
                              }
                            }}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800">{member.fullName}</span>
                            <span className="text-xs text-slate-500 ml-1.5 font-mono">({member.id})</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Summary box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-bold text-emerald-950">
                <span>Total Collection:</span>
                <span className="text-base text-emerald-800">
                  {formatCurrency(selectedMemberIds.length * bulkAmount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 mt-3">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={selectedMemberIds.length === 0}
                onClick={handleExecuteBulkPayment}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-bold shadow-md"
              >
                Collect for {selectedMemberIds.length} Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
