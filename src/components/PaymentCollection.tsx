import React, { useState, useMemo, useEffect } from 'react';
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
  Calendar,
  CalendarRange,
  Coins,
  CheckSquare,
  Square,
  Info,
  Layers,
  Sparkles,
  FileDown,
} from 'lucide-react';

interface PaymentCollectionProps {
  initialMemberId?: string;
  onPaymentSuccess?: () => void;
}

const MONTH_NAMES = [
  { num: '01', en: 'Jan', ur: 'جنوری' },
  { num: '02', en: 'Feb', ur: 'فروری' },
  { num: '03', en: 'Mar', ur: 'مارچ' },
  { num: '04', en: 'Apr', ur: 'اپریل' },
  { num: '05', en: 'May', ur: 'مئی' },
  { num: '06', en: 'Jun', ur: 'جون' },
  { num: '07', en: 'Jul', ur: 'جولائی' },
  { num: '08', en: 'Aug', ur: 'اگست' },
  { num: '09', en: 'Sep', ur: 'ستمبر' },
  { num: '10', en: 'Oct', ur: 'اکتوبر' },
  { num: '11', en: 'Nov', ur: 'نومبر' },
  { num: '12', en: 'Dec', ur: 'دسمبر' },
];

export const PaymentCollection: React.FC<PaymentCollectionProps> = ({
  initialMemberId,
}) => {
  const {
    state,
    language,
    isAdmin,
    addPayment,
    updatePayment,
    deletePayment,
    setLatestReceipt,
    getMemberSummary,
  } = useApp();
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'record' | 'history' | 'annual_emergency'>('record');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialMemberId || state.members[0]?.id || ''
  );
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>('monthly');
  const [amountReceived, setAmountReceived] = useState<number>(state.settings.monthlyFee || 100);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [relevantPeriod, setRelevantPeriod] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  // Multi-Year Annual Monthly Fee State
  const currentYearNum = new Date().getFullYear();
  const [annualStartYear, setAnnualStartYear] = useState<number>(2023);
  const [annualEndYear, setAnnualEndYear] = useState<number>(currentYearNum);
  const [annualMonthlyFeeRate, setAnnualMonthlyFeeRate] = useState<number>(
    state.settings.monthlyFee || 100
  );
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [skipAlreadyPaid, setSkipAlreadyPaid] = useState<boolean>(true);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');

  // Search & Filter in Payment History
  const [historySearch, setHistorySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Edit / Delete State
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  // Annual Emergency Contribution Form State
  const [annualYear, setAnnualYear] = useState(currentYearNum.toString());
  const [annualDeathsCount, setAnnualDeathsCount] = useState<number>(6);
  const [annualRatePerDeath, setAnnualRatePerDeath] = useState<number>(
    state.settings.emergencyFee || 100
  );
  const [annualMemberId, setAnnualMemberId] = useState(state.members[0]?.id || '');
  const [annualSuccessMsg, setAnnualSuccessMsg] = useState<string | null>(null);

  // Selected Member Details
  const selectedMember = state.members.find((m) => m.id === selectedMemberId);
  const selectedMemberSummary = selectedMember ? getMemberSummary(selectedMember.id) : null;

  // Set of all months already paid by the currently selected member
  const paidMonthsSet = useMemo(() => {
    if (!selectedMemberId) return new Set<string>();
    const set = new Set<string>();

    // Check obligations marked as paid
    for (const obl of state.obligations) {
      if (
        obl.memberId === selectedMemberId &&
        obl.type === 'monthly' &&
        obl.status === 'paid' &&
        obl.periodMonth
      ) {
        set.add(obl.periodMonth);
      }
    }

    // Check payments with monthly allocations or relevant period
    for (const pay of state.payments) {
      if (pay.memberId === selectedMemberId && pay.status !== 'reversed') {
        if (pay.allocations && pay.allocations.length > 0) {
          for (const alloc of pay.allocations) {
            if (alloc.periodMonth && (alloc.type === 'monthly' || pay.paymentCategory === 'annual_monthly')) {
              set.add(alloc.periodMonth);
            }
          }
        } else if (
          (pay.paymentCategory === 'monthly' || pay.paymentCategory === 'annual_monthly') &&
          pay.relevantPeriod &&
          pay.relevantPeriod.length === 7
        ) {
          set.add(pay.relevantPeriod);
        }
      }
    }

    return set;
  }, [selectedMemberId, state.obligations, state.payments]);

  // Generate list of all months in the selected Start Year to End Year range
  const allMonthsInRange = useMemo(() => {
    const list: string[] = [];
    const startY = Math.min(annualStartYear, annualEndYear);
    const endY = Math.max(annualStartYear, annualEndYear);
    for (let y = startY; y <= endY; y++) {
      for (const m of MONTH_NAMES) {
        list.push(`${y}-${m.num}`);
      }
    }
    return list;
  }, [annualStartYear, annualEndYear]);

  // Synchronize selectedMonths when Start/End Year or skipAlreadyPaid or member changes
  useEffect(() => {
    if (paymentCategory === 'annual_monthly') {
      const initial = allMonthsInRange.filter((mth) => {
        if (skipAlreadyPaid && paidMonthsSet.has(mth)) {
          return false;
        }
        return true;
      });
      setSelectedMonths(initial);
    }
  }, [allMonthsInRange, skipAlreadyPaid, paidMonthsSet, paymentCategory]);

  // Auto-calculate total and synchronize amountReceived for annual_monthly
  useEffect(() => {
    if (paymentCategory === 'annual_monthly') {
      const total = selectedMonths.length * annualMonthlyFeeRate;
      setAmountReceived(total);
      if (total > 0) {
        setPaymentStatus('paid');
      }

      // Auto update remarks note
      if (selectedMember && selectedMonths.length > 0) {
        const startY = Math.min(annualStartYear, annualEndYear);
        const endY = Math.max(annualStartYear, annualEndYear);
        setNotes(
          `Annual monthly fee for ${startY} to ${endY} (${selectedMonths.length} months @ Rs. ${annualMonthlyFeeRate}/mo) for ${selectedMember.fullName}`
        );
      }
    }
  }, [selectedMonths, annualMonthlyFeeRate, paymentCategory, annualStartYear, annualEndYear, selectedMember]);

  // Category change handler
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
    } else if (cat === 'annual_monthly') {
      const total = selectedMonths.length * annualMonthlyFeeRate;
      setAmountReceived(total);
    }
  };

  // Toggle single month in selection
  const handleToggleMonth = (mth: string) => {
    if (selectedMonths.includes(mth)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== mth));
    } else {
      setSelectedMonths([...selectedMonths, mth].sort());
    }
  };

  // Toggle all months for a specific year
  const handleToggleYear = (year: number) => {
    const yearPrefix = `${year}-`;
    const yearMonths = allMonthsInRange.filter((m) => m.startsWith(yearPrefix));
    const allYearSelected = yearMonths.every((m) => selectedMonths.includes(m));

    if (allYearSelected) {
      // Deselect all for this year
      setSelectedMonths(selectedMonths.filter((m) => !m.startsWith(yearPrefix)));
    } else {
      // Select all for this year (excluding paid if skipAlreadyPaid is true)
      const toAdd = yearMonths.filter((m) => !skipAlreadyPaid || !paidMonthsSet.has(m));
      const combined = Array.from(new Set([...selectedMonths, ...toAdd])).sort();
      setSelectedMonths(combined);
    }
  };

  // Select all months in range
  const handleSelectAllRange = () => {
    if (skipAlreadyPaid) {
      setSelectedMonths(allMonthsInRange.filter((m) => !paidMonthsSet.has(m)));
    } else {
      setSelectedMonths([...allMonthsInRange]);
    }
  };

  // Deselect all
  const handleClearAllRange = () => {
    setSelectedMonths([]);
  };

  // Quick preset year range buttons
  const applyPresetYears = (start: number, end: number) => {
    setAnnualStartYear(start);
    setAnnualEndYear(end);
  };

  // Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || amountReceived <= 0) return;

    if (paymentCategory === 'annual_monthly') {
      if (selectedMonths.length === 0) {
        alert('Please select at least one month for Annual Monthly Fee collection.');
        return;
      }

      const startY = Math.min(annualStartYear, annualEndYear);
      const endY = Math.max(annualStartYear, annualEndYear);
      const periodLabel = `${startY} - ${endY} (${selectedMonths.length} Months)`;

      addPayment({
        memberId: selectedMemberId,
        amountReceived,
        paymentCategory: 'annual_monthly',
        paymentMethod,
        date: paymentDate,
        relevantPeriod: periodLabel,
        notes:
          notes ||
          `Annual monthly fee (${startY} to ${endY}, ${selectedMonths.length} months) for ${selectedMember?.fullName}`,
        coveredMonths: selectedMonths,
      });
    } else {
      addPayment({
        memberId: selectedMemberId,
        amountReceived,
        paymentCategory,
        paymentMethod,
        date: paymentDate,
        relevantPeriod,
        notes,
      });
    }

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
    const mem = state.members.find((m) => m.id === annualMemberId);
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

    setAnnualSuccessMsg(
      `Recorded Annual Emergency Contribution of Rs. ${totalAmount} for ${mem.fullName}!`
    );
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

  // Calculate year list for multi-year view
  const yearsInRange = useMemo(() => {
    const startY = Math.min(annualStartYear, annualEndYear);
    const endY = Math.max(annualStartYear, annualEndYear);
    const arr: number[] = [];
    for (let y = startY; y <= endY; y++) {
      arr.push(y);
    }
    return arr;
  }, [annualStartYear, annualEndYear]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            فیس و ادائیگیوں کا انتظام (Fees Wasooli & Payment Collection)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Collect regular monthly fees, multi-year annual monthly fees, emergency funds, and issue instant receipts
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setActiveSubTab('record');
            }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'record'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Record Payment (نئی وصولی)
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment History ({state.payments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('annual_emergency')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'annual_emergency'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual Emergency Fund
          </button>
        </div>
      </div>

      {/* VIEW 1: RECORD PAYMENT FORM */}
      {activeSubTab === 'record' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-700" />
                <span>Record Member Fee Payment / وصولی فارم</span>
              </h3>
              {paymentCategory === 'annual_monthly' && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                  <CalendarRange className="w-3.5 h-3.5" />
                  Multiple Years Fee Mode
                </span>
              )}
            </div>

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

              {/* Fee Category Selection: Both Dropdown and Visual Cards */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-800">
                    Fee Category / فیس کی مد منتخب کریں *
                  </label>
                  <span className="text-[11px] text-slate-500 font-urdu">
                    زمرہ فیس
                  </span>
                </div>

                {/* Dropdown Requirement: Must appear in Fees Wasooli category dropdown */}
                <select
                  value={paymentCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as PaymentCategory)}
                  className="w-full mb-2.5 px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="monthly">Monthly Fee (ماہانہ فیس)</option>
                  <option value="annual_monthly">Annual Monthly Fee (سالانہ ماہانہ فیس)</option>
                  <option value="emergency">Emergency Fee (کفن دفن فنڈ)</option>
                  <option value="annual_emergency">Annual Emergency Fee (سالانہ کفن دفن فنڈ)</option>
                  <option value="registration">Registration Fee (داخلہ فیس)</option>
                  <option value="donation">General Donation (عطیات و امداد)</option>
                </select>

                {/* Category Buttons for fast touch input */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('monthly')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'monthly'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="block text-xs">Monthly Fee</span>
                    <span className="text-[11px] font-normal">Rs. {state.settings.monthlyFee || 100}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('annual_monthly')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'annual_monthly'
                        ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400'
                        : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border-indigo-200'
                    }`}
                  >
                    <span className="block text-xs">Annual Monthly</span>
                    <span className="text-[11px] font-normal font-urdu">سالانہ ماہانہ فیس</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('emergency')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'emergency'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs ring-2 ring-purple-400'
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
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="block text-xs">Registration</span>
                    <span className="text-[11px] font-normal">Rs. {state.settings.registrationFee || 200}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('donation')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                      paymentCategory === 'donation'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-xs ring-2 ring-blue-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="block text-xs">Donation</span>
                    <span className="text-[11px] font-normal font-urdu">عطیہ / امداد</span>
                  </button>
                </div>
              </div>

              {/* MULTI-YEAR ANNUAL MONTHLY FEE PANEL (Requirements 2, 3, 4) */}
              {paymentCategory === 'annual_monthly' && (
                <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-200/80">
                    <div>
                      <h4 className="font-extrabold text-indigo-950 text-sm sm:text-base flex items-center gap-2">
                        <CalendarRange className="w-5 h-5 text-indigo-700" />
                        <span>Annual Monthly Fee Collection (کثیر سالہ ماہانہ فیس وصولی)</span>
                      </h4>
                      <p className="text-xs text-indigo-900/80 mt-0.5">
                        Collect previous and future years in one transaction (e.g. 2023, 2024, 2025, 2026).
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 font-semibold mr-1">Presets:</span>
                      <button
                        type="button"
                        onClick={() => applyPresetYears(2023, 2026)}
                        className="px-2 py-1 rounded bg-white hover:bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 cursor-pointer"
                      >
                        2023-2026 (4 Yrs)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetYears(2024, 2026)}
                        className="px-2 py-1 rounded bg-white hover:bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 cursor-pointer"
                      >
                        2024-2026 (3 Yrs)
                      </button>
                    </div>
                  </div>

                  {/* Year Range & Rate Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Select Start Year / ابتدائی سال *
                      </label>
                      <select
                        value={annualStartYear}
                        onChange={(e) => setAnnualStartYear(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-black text-slate-900"
                      >
                        {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                          <option key={yr} value={yr}>
                            Year {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Select End Year / اختتامی سال *
                      </label>
                      <select
                        value={annualEndYear}
                        onChange={(e) => setAnnualEndYear(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-black text-slate-900"
                      >
                        {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(
                          (yr) => (
                            <option key={yr} value={yr}>
                              Year {yr}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Monthly Fee Per Month (PKR) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={annualMonthlyFeeRate}
                        onChange={(e) => setAnnualMonthlyFeeRate(parseInt(e.target.value, 10) || 100)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-black text-slate-900"
                      />
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Default Rs. 100 / month
                      </span>
                    </div>
                  </div>

                  {/* Duplicate Prevention & Exclude Already Paid Months Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-indigo-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={skipAlreadyPaid}
                        onChange={(e) => setSkipAlreadyPaid(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-700 focus:ring-indigo-500"
                      />
                      <span>Prevent duplicate entries: Automatically skip already-paid months</span>
                    </label>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllRange}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded font-bold cursor-pointer transition"
                      >
                        Select All Months
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllRange}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer transition"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Year-by-Year Month Matrix Selection */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {yearsInRange.map((yr) => {
                      const yrPrefix = `${yr}-`;
                      const yrMonths = allMonthsInRange.filter((m) => m.startsWith(yrPrefix));
                      const yrSelectedCount = yrMonths.filter((m) => selectedMonths.includes(m)).length;
                      const allYrSelected = yrMonths.length > 0 && yrSelectedCount === yrMonths.length;

                      return (
                        <div
                          key={yr}
                          className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
                                Year {yr}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {yrSelectedCount} / {yrMonths.length} months selected
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleYear(yr)}
                              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                            >
                              {allYrSelected ? 'Deselect Year' : 'Select Full Year (12 Months)'}
                            </button>
                          </div>

                          {/* 12 Months Grid */}
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {MONTH_NAMES.map((m) => {
                              const mthStr = `${yr}-${m.num}`;
                              const isPaid = paidMonthsSet.has(mthStr);
                              const isSelected = selectedMonths.includes(mthStr);

                              return (
                                <button
                                  key={mthStr}
                                  type="button"
                                  onClick={() => handleToggleMonth(mthStr)}
                                  className={`p-1.5 rounded-lg border text-center transition cursor-pointer text-xs flex flex-col items-center justify-center ${
                                    isSelected
                                      ? 'bg-indigo-700 text-white border-indigo-700 font-bold shadow-2xs'
                                      : isPaid
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                                  }`}
                                >
                                  <span className="leading-tight">{m.en}</span>
                                  {isPaid && !isSelected ? (
                                    <span className="text-[9px] text-emerald-700 font-bold leading-none mt-0.5">
                                      ✓ Paid
                                    </span>
                                  ) : isSelected ? (
                                    <span className="text-[9px] text-indigo-100 leading-none mt-0.5">
                                      Rs. {annualMonthlyFeeRate}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                                      Unpaid
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AUTOMATIC CALCULATION DISPLAY (Requirement 3) */}
                  <div className="p-3.5 bg-indigo-950 text-white rounded-xl shadow-xs space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="text-indigo-200">
                        Selected Months Calculation Formula:
                      </span>
                      <span className="font-mono text-indigo-100 font-bold">
                        {selectedMonths.length} Months × Rs. {annualMonthlyFeeRate} per month
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-indigo-800">
                      <span className="text-sm font-bold text-white">
                        Total Calculated Monthly Fee (کل واجب الادا رقم):
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300">
                        {formatCurrency(selectedMonths.length * annualMonthlyFeeRate)}
                      </span>
                    </div>

                    {selectedMonths.length > 0 && (
                      <div className="text-[11px] text-indigo-300 truncate">
                        Covering: {selectedMonths[0]} through {selectedMonths[selectedMonths.length - 1]} ({selectedMonths.length} total active monthly fees)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Payment Fields: Amount, Date, Period, Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Amount Received / وصول شدہ رقم (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amountReceived}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setAmountReceived(val);
                      if (paymentCategory === 'annual_monthly') {
                        const targetTotal = selectedMonths.length * annualMonthlyFeeRate;
                        if (val >= targetTotal && targetTotal > 0) setPaymentStatus('paid');
                        else if (val > 0) setPaymentStatus('partial');
                        else setPaymentStatus('unpaid');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-slate-900 text-base focus:ring-2 focus:ring-emerald-500"
                  />
                  {paymentCategory === 'annual_monthly' && (
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Auto-calculated from selected months (can be edited if partial payment received)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Payment Date / ادائیگی کی تاریخ *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Period Display / Input */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    {paymentCategory === 'annual_monthly'
                      ? 'Covered Years & Months / دورانیہ'
                      : 'Relevant Month / Period'}
                  </label>
                  {paymentCategory === 'annual_monthly' ? (
                    <input
                      type="text"
                      readOnly
                      value={`${Math.min(annualStartYear, annualEndYear)} - ${Math.max(
                        annualStartYear,
                        annualEndYear
                      )} (${selectedMonths.length} Months)`}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-100 font-bold text-slate-800"
                    />
                  ) : (
                    <input
                      type="month"
                      value={relevantPeriod}
                      onChange={(e) => setRelevantPeriod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  )}
                </div>

                {/* Payment Status (Requirement 2: Payment Status) */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Payment Status / ادائیگی کی کیفیت *
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white"
                  >
                    <option value="paid">Paid (مکمل ادا شدہ)</option>
                    <option value="partial">Partial (جزوی ادا شدہ)</option>
                    <option value="unpaid">Unpaid (غیر ادا شدہ)</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Payment Method / ذریعہ ادائیگی
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

                {/* Remarks (Requirement 2: Remarks) */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Payment Reference / Remarks / نوٹ
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Annual monthly fee 2023-2026 / Receipt reference"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={amountReceived <= 0}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md text-sm sm:text-base cursor-pointer transition flex items-center justify-center gap-2"
              >
                <ReceiptText className="w-5 h-5" />
                <span>
                  {paymentCategory === 'annual_monthly'
                    ? `Save Annual Monthly Fee (${formatCurrency(amountReceived)}) & Issue Receipt`
                    : 'Save Payment & Generate Official Receipt'}
                </span>
              </button>
            </form>
          </div>

          {/* Member Snapshot Card */}
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
                    <p className="text-slate-500 mt-0.5">{selectedMember.address}</p>
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

                  {/* Member paid months info */}
                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-950">
                    <div className="font-bold flex items-center justify-between">
                      <span>Monthly Fee Settlement:</span>
                      <span className="font-mono text-indigo-800">
                        {paidMonthsSet.size} Months Paid
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800 mt-0.5">
                      {paidMonthsSet.size > 0
                        ? `${paidMonthsSet.size} monthly installments marked settled in member khata.`
                        : 'No monthly fees recorded yet for this member.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center mt-4 pt-3 border-t border-slate-100">
              Official Receipt Prefix: {state.settings.receiptPrefix}
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
              <option value="all">All Categories (تمام مدات)</option>
              <option value="annual_monthly">Annual Monthly Fee (سالانہ ماہانہ فیس)</option>
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
                    <th className="py-2.5 px-3 sm:px-4">Period / Months</th>
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
                            pay.paymentCategory === 'annual_monthly'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              : pay.paymentCategory === 'monthly'
                              ? 'bg-blue-100 text-blue-800'
                              : pay.paymentCategory === 'emergency' || pay.paymentCategory === 'annual_emergency'
                              ? 'bg-purple-100 text-purple-800'
                              : pay.paymentCategory === 'registration'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pay.paymentCategory === 'annual_monthly' ? 'Annual Monthly' : pay.paymentCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-600 text-xs">
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
                            title="Payment Receipt PDF"
                            className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 cursor-pointer"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setLatestReceipt(pay)}
                            title="View / Print Receipt"
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => setEditingPayment(pay)}
                                title="Edit Payment"
                                className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingPaymentId(pay.id)}
                                title="Delete Payment"
                                className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 cursor-pointer"
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
                No payment transactions recorded yet.
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

      {/* Edit Payment Modal (Requirement 6: Edit and Delete) */}
      {editingPayment && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Edit Payment Record ({editingPayment.receiptNumber})
              </h3>
              <button
                onClick={() => setEditingPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
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
                    onChange={(e) =>
                      setEditingPayment({
                        ...editingPayment,
                        amountReceived: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingPayment.date}
                    onChange={(e) =>
                      setEditingPayment({ ...editingPayment, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingPayment.paymentCategory}
                    onChange={(e) =>
                      setEditingPayment({
                        ...editingPayment,
                        paymentCategory: e.target.value as PaymentCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="annual_monthly">Annual Monthly Fee (سالانہ ماہانہ فیس)</option>
                    <option value="monthly">Monthly Fee (ماہانہ فیس)</option>
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
                    onChange={(e) =>
                      setEditingPayment({
                        ...editingPayment,
                        relevantPeriod: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={editingPayment.paymentMethod}
                  onChange={(e) =>
                    setEditingPayment({
                      ...editingPayment,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Notes</label>
                <input
                  type="text"
                  value={editingPayment.notes}
                  onChange={(e) =>
                    setEditingPayment({ ...editingPayment, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 bg-slate-200 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Modal (Requirement 6: Edit and Delete) */}
      {deletingPaymentId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Confirm Payment Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this payment record? The received amount will be deducted from financial totals and the member's paid balance will update immediately.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeletingPaymentId(null)}
                className="px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePayment(deletingPaymentId)}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold cursor-pointer"
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
