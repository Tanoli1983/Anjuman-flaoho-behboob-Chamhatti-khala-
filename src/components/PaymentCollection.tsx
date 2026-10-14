import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PaymentAllocation, PaymentMethod } from '../types';
import {
  ReceiptText,
  User,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PaymentCollectionProps {
  initialMemberId?: string;
  onPaymentSuccess?: () => void;
}

export const PaymentCollection: React.FC<PaymentCollectionProps> = ({
  initialMemberId,
  onPaymentSuccess,
}) => {
  const { state, language, recordPayment, getMemberSummary } = useApp();
  const t = translations[language];

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialMemberId || state.members[0]?.id || ''
  );

  const selectedMember = state.members.find((m) => m.id === selectedMemberId);
  const memberSummary = selectedMember ? getMemberSummary(selectedMember.id) : null;

  // Unpaid obligations for selected member
  const unpaidObligations = state.obligations.filter(
    (o) => o.memberId === selectedMemberId && o.status !== 'paid' && o.status !== 'waived'
  );

  const totalMemberDue = unpaidObligations.reduce(
    (sum, o) => sum + Math.max(0, o.amountDue - o.amountPaid),
    0
  );

  const [amountReceived, setAmountReceived] = useState<number>(totalMemberDue > 0 ? totalMemberDue : 100);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<{ [obligationId: string]: number }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initialMemberId when prop changes
  useEffect(() => {
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
    }
  }, [initialMemberId]);

  // When selected member changes, reset allocations and suggest amount
  useEffect(() => {
    if (unpaidObligations.length > 0) {
      const due = unpaidObligations.reduce((sum, o) => sum + Math.max(0, o.amountDue - o.amountPaid), 0);
      setAmountReceived(due);
      autoAllocateAmount(due);
    } else {
      setAmountReceived(0);
      setAllocations({});
    }
    setErrorMessage(null);
  }, [selectedMemberId]);

  // Smart Auto-Allocation (FIFO: Oldest dues first)
  const autoAllocateAmount = (amount: number) => {
    let remaining = Math.max(0, Math.round(amount));
    const newAlloc: { [oblId: string]: number } = {};

    for (const obl of unpaidObligations) {
      const needed = Math.max(0, Math.round(obl.amountDue) - Math.round(obl.amountPaid));
      if (needed > 0 && remaining > 0) {
        const canPay = Math.min(needed, remaining);
        newAlloc[obl.id] = canPay;
        remaining -= canPay;
      } else {
        newAlloc[obl.id] = 0;
      }
    }

    setAllocations(newAlloc);
  };

  const handleManualAllocationChange = (oblId: string, val: number) => {
    setAllocations((prev) => ({
      ...prev,
      [oblId]: Math.max(0, val),
    }));
  };

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const unallocatedDifference = amountReceived - totalAllocated;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedMember) {
      setErrorMessage('Please select a member.');
      return;
    }

    if (amountReceived <= 0) {
      setErrorMessage('Payment amount received must be greater than zero.');
      return;
    }

    if (totalAllocated !== amountReceived) {
      setErrorMessage(
        `Total allocated (PKR ${totalAllocated}) does not match amount received (PKR ${amountReceived}). All collected funds must be allocated explicitly.`
      );
      return;
    }

    // Construct valid allocations array
    const validAllocations: PaymentAllocation[] = [];
    for (const [oblId, amt] of Object.entries(allocations)) {
      if (amt > 0) {
        const obl = state.obligations.find((o) => o.id === oblId);
        if (obl) {
          validAllocations.push({
            obligationId: obl.id,
            type: obl.type,
            periodMonth: obl.periodMonth,
            emergencyEventId: obl.emergencyEventId,
            title: obl.title,
            amount: amt,
          });
        }
      }
    }

    try {
      recordPayment({
        memberId: selectedMember.id,
        amountReceived,
        paymentDate,
        paymentMethod,
        notes,
        allocations: validAllocations,
      });

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment recording failed.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.payment.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.payment.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
          {errorMessage && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Member Selection */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Select Member / ممبر منتخب کریں *
              </label>
              <div className="relative">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  {state.members.map((m) => {
                    const s = getMemberSummary(m.id);
                    return (
                      <option key={m.id} value={m.id}>
                        {m.id} — {m.fullName} s/o {m.fatherName} (Dues: PKR {s?.totalBalance || 0})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Payment Amount & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Amount Received (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amountReceived}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setAmountReceived(val);
                    autoAllocateAmount(val);
                  }}
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">Cash (نقد کیش)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Allocation Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    Obligation Allocations / فیس کی مدات
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Allocate cash received explicitly across member's dues
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => autoAllocateAmount(amountReceived)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Allocate</span>
                </button>
              </div>

              {unpaidObligations.length > 0 ? (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {unpaidObligations.map((obl) => {
                    const remainingDue = Math.max(0, obl.amountDue - obl.amountPaid);
                    const currentAlloc = allocations[obl.id] || 0;

                    return (
                      <div
                        key={obl.id}
                        className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                obl.type === 'monthly'
                                  ? 'bg-blue-100 text-blue-800'
                                  : obl.type === 'emergency'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              {obl.type}
                            </span>
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              {obl.title}
                            </span>
                          </div>
                          <span className="text-slate-500 text-xs mt-0.5 block">
                            Total: PKR {obl.amountDue} • Already Paid: PKR {obl.amountPaid} • Remaining Due: PKR {remainingDue}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500">Allocate PKR:</span>
                          <input
                            type="number"
                            min="0"
                            max={remainingDue}
                            value={currentAlloc}
                            onChange={(e) =>
                              handleManualAllocationChange(
                                obl.id,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-24 px-2 py-1 border border-slate-300 rounded-lg font-bold text-right text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center font-medium">
                  This member currently has no recorded outstanding obligations.
                </div>
              )}
            </div>

            {/* Reconciliation Check Bar */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs sm:text-sm ${
                unallocatedDifference === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div>
                <span>Total Allocated: </span>
                <span className="font-extrabold">{formatCurrency(totalAllocated)}</span>
                <span> of {formatCurrency(amountReceived)}</span>
              </div>
              <div>
                {unallocatedDifference === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                    <CheckCircle2 className="w-4 h-4" /> 100% Balanced
                  </span>
                ) : (
                  <span className="text-amber-800">
                    Difference: {formatCurrency(Math.abs(unallocatedDifference))} ({unallocatedDifference > 0 ? 'Unallocated' : 'Over-allocated'})
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Notes / ملاحظات
              </label>
              <input
                type="text"
                placeholder="Optional remark or reference voucher"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={amountReceived <= 0 || unallocatedDifference !== 0}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md text-sm sm:text-base cursor-pointer transition flex items-center justify-center gap-2"
            >
              <ReceiptText className="w-5 h-5" />
              <span>Record Payment & Print Official Receipt</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Member Snapshot Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Member Account Summary</span>
            </h3>

            {selectedMember && memberSummary ? (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {selectedMember.id}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {selectedMember.fullName}
                  </h4>
                  <p className="text-slate-500">ولد: {selectedMember.fatherName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Due:</span>
                    <span className="font-bold">{formatCurrency(memberSummary.monthlyDue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Paid:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(memberSummary.monthlyPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span className="text-slate-600">Monthly Balance:</span>
                    <span className="font-bold text-amber-700">{formatCurrency(memberSummary.monthlyBalance)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Emergency Due:</span>
                    <span className="font-bold">{formatCurrency(memberSummary.emergencyDue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Emergency Paid:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(memberSummary.emergencyPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span className="text-slate-600">Emergency Balance:</span>
                    <span className="font-bold text-amber-700">{formatCurrency(memberSummary.emergencyBalance)}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <span className="text-slate-600 text-[11px] block font-medium">
                    Total Current Dues Owed
                  </span>
                  <span className="text-2xl font-black text-amber-800 block mt-0.5">
                    {formatCurrency(memberSummary.totalBalance)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Select a member to view dues.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-4 pt-3 border-t border-slate-100">
            Receipts follow numbering prefix: {state.settings.receiptPrefix}
          </div>
        </div>
      </div>
    </div>
  );
};
