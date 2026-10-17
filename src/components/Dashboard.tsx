import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Users,
  UserPlus,
  ReceiptText,
  HeartHandshake,
  TrendingDown,
  ShieldCheck,
  CalendarCheck,
  CalendarRange,
  Clock,
  Printer,
  Sparkles,
  RotateCcw,
  FileDown,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Dashboard: React.FC<{ onOpenTests: () => void }> = ({ onOpenTests }) => {
  const { state, language, isAdmin, accountingSummary, setActiveTab, setLatestReceipt, cleanAllFinancialRecords } = useApp();
  const t = translations[language];

  // Calculate new members this month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const newMembersThisMonthCount = (state.members || []).filter(m => m.joiningMonth === currentMonthStr).length;

  // Combine recent transactions (payments, expenses, incomes)
  const recentTransactions = [
    ...(state.payments || []).slice(0, 8).map(p => ({
      id: p.id,
      type: 'payment' as const,
      title: `${p.memberName} (${p.receiptNumber})`,
      subtitle: `${p.paymentCategory === 'annual_monthly' ? 'ANNUAL MONTHLY' : p.paymentCategory.toUpperCase()} Fee • ${p.relevantPeriod ? p.relevantPeriod + ' • ' : ''}${p.notes || 'Recorded in cash/bank'}`,
      amount: p.amountReceived,
      date: p.date,
      status: p.status,
      raw: p,
    })),
    ...(state.expenses || []).slice(0, 5).map(e => ({
      id: e.id,
      type: 'expense' as const,
      title: `${e.title || e.category} - ${e.paidTo}`,
      subtitle: e.description,
      amount: e.amount,
      date: e.date,
      status: e.status,
      raw: e,
    })),
    ...(state.incomes || []).slice(0, 5).map(i => ({
      id: i.id,
      type: 'income' as const,
      title: `${i.category} - ${i.receivedFrom}`,
      subtitle: i.description,
      amount: i.amount,
      date: i.date,
      status: i.status,
      raw: i,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const [showCleanConfirmModal, setShowCleanConfirmModal] = React.useState(false);

  const handleExecuteCleanFinancials = () => {
    cleanAllFinancialRecords();
    setShowCleanConfirmModal(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {state.settings.financialYear} • Karachi, Pakistan
            </span>
            <h2 className="text-lg sm:text-2xl font-bold leading-tight">
              {state.settings.orgName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-urdu mt-1">
              {state.settings.orgNameUrdu}
            </p>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-block bg-emerald-950/60 text-amber-200 px-2.5 py-0.5 rounded-md border border-emerald-500/40 font-medium">
                {language === 'ur'
                  ? (state.settings.registrationNumberUrdu || 'رجسٹریشن نمبر: K/2018 DSW(4347)')
                  : (state.settings.registrationNumber || 'Registered Number: K/2018 DSW(4347)')}
              </span>
            </div>
          </div>

          {/* Quick Cash Balance Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20 flex flex-col items-start md:items-end">
            <span className="text-xs font-medium text-emerald-200">
              Total Available Balance (خالص کیش بیلنس)
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 tracking-tight">
              {formatCurrency(accountingSummary.netCashBalance)}
            </span>
            <span className="text-[11px] text-emerald-200/80 mt-1">
              Total Income: {formatCurrency(accountingSummary.totalIncomeCollected)} | Expenses: {formatCurrency(accountingSummary.totalExpenses)}
            </span>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* PWA Mobile Installation Callout */}
      <PWAInstallButton variant="banner" />

      {/* Main 4 Primary KPI Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Available Cash Balance */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 truncate">Total Available Balance</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-700">
              {formatCurrency(accountingSummary.netCashBalance)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              Income ({formatCurrency(accountingSummary.totalIncomeCollected)}) − Expenses ({formatCurrency(accountingSummary.totalExpenses)})
            </div>
          </div>
        </div>

        {/* Total Income Collected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.totalIncome}</span>
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-teal-700">
              {formatCurrency(accountingSummary.totalIncomeCollected)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              Monthly + Annual Monthly + Emergency + Reg + Donations
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.totalExpenses}</span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-rose-700">
              {formatCurrency(accountingSummary.totalExpenses)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              Dar-ul-Baqa Cemetery & Welfare
            </div>
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.totalMembers}</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900">
              {state.members.length} Members
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 truncate">
              {accountingSummary.totalActiveMembers} Active • {newMembersThisMonthCount} this month
            </div>
          </div>
        </div>
      </div>

      {/* Quick Operation Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>{t.dashboard.quickActions}</span>
          <span className="text-xs font-normal text-slate-500 font-urdu">فوری کارروائیاں</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <button
            onClick={() => setActiveTab('payment')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 transition border border-emerald-200/80 cursor-pointer font-semibold text-xs sm:text-sm"
          >
            <div className="p-2 rounded-lg bg-emerald-700 text-white shrink-0">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight">{t.nav.collectPayment}</div>
              <div className="text-[10px] text-emerald-600 font-urdu">فیس وصولی</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 active:scale-95 transition border border-blue-200/80 cursor-pointer font-semibold text-xs sm:text-sm"
          >
            <div className="p-2 rounded-lg bg-blue-700 text-white shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight">{t.members.addNewMember}</div>
              <div className="text-[10px] text-blue-600 font-urdu">نیا ممبر</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('officeBearers')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 active:scale-95 transition border border-purple-200/80 cursor-pointer font-semibold text-xs sm:text-sm"
          >
            <div className="p-2 rounded-lg bg-purple-700 text-white shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight">عہدیداران</div>
              <div className="text-[10px] text-purple-600">Office-Bearers</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 active:scale-95 transition border border-rose-200/80 cursor-pointer font-semibold text-xs sm:text-sm"
          >
            <div className="p-2 rounded-lg bg-rose-700 text-white shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight">نیا خرچہ</div>
              <div className="text-[10px] text-rose-600">Expense</div>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Detailed Fee Category Cards (Separating all 5/6 income streams) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* 1. Regular Monthly Fees Received */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-700 truncate">Regular Monthly</span>
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              {formatCurrency(accountingSummary.totalMonthlyFees)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              Rs. {state.settings.monthlyFee || 100} / month
            </div>
          </div>
        </div>

        {/* 2. Annual Monthly Fee (Multi-Year) */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-white p-3 rounded-xl border border-indigo-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[11px] font-bold text-indigo-950 truncate">Annual Monthly Fee</span>
            <CalendarRange className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-indigo-900">
              {formatCurrency(accountingSummary.totalAnnualMonthlyFees || 0)}
            </div>
            <div className="text-[10px] text-indigo-700 font-urdu mt-0.5 truncate">
              سالانہ ماہانہ فیس (Multi-Year)
            </div>
          </div>
        </div>

        {/* 3. Emergency Fees Received (Per Death) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-700 truncate">Emergency Fee</span>
            <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-purple-900">
              {formatCurrency(
                (state.payments || [])
                  .filter(p => p.status !== 'reversed' && p.paymentCategory === 'emergency')
                  .reduce((sum, p) => sum + p.amountReceived, 0)
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              کفن دفن فنڈ (فی وفات)
            </div>
          </div>
        </div>

        {/* 4. Annual Emergency Fee */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-700 truncate">Annual Emergency</span>
            <HeartHandshake className="w-3.5 h-3.5 text-purple-700" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-purple-900">
              {formatCurrency(
                (state.payments || [])
                  .filter(p => p.status !== 'reversed' && p.paymentCategory === 'annual_emergency')
                  .reduce((sum, p) => sum + p.amountReceived, 0)
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              سالانہ کفن دفن فنڈ
            </div>
          </div>
        </div>

        {/* 5. Registration Fees Received */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-700 truncate">Registration Fee</span>
            <ReceiptText className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-teal-800">
              {formatCurrency(accountingSummary.totalRegistrationFees)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              داخلہ فیس (New Members)
            </div>
          </div>
        </div>

        {/* 6. Donations & Other Income */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-700 truncate">Donations / Other</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-amber-900">
              {formatCurrency(accountingSummary.totalDonationsAndOtherIncome)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate font-urdu">
              عام عطیات و امداد
            </div>
          </div>
        </div>
      </div>

      {/* Clean Slate Confirmation / Reset Button for Admin */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <RotateCcw className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-amber-950 block">
                Reset All Financial Transactions to Zero
              </span>
              <span className="text-xs text-amber-800">
                Wipes all unverified payments, expenses, and donations while preserving all registered members and office-bearers.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCleanConfirmModal(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Reset Financials to Zero
          </button>
        </div>
      )}

      {/* Confirmation Modal for Resetting Financial Transactions */}
      {showCleanConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset All Financial Records to Zero?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  This will permanently wipe all payment entries, expenses, donations, and fee obligations, returning all totals to Rs. 0.
                </p>
                <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <span className="font-bold">Preserved:</span> All registered members ({state.members.length}), office-bearers, and settings will remain completely intact.
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCleanConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCleanFinancials}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                Yes, Reset to Zero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Recent Verified Transactions</span>
          </h3>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            View Master Ledger →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 sm:p-4 hover:bg-slate-50 transition flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      tx.type === 'payment'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tx.type === 'income'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tx.type}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {tx.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {tx.subtitle} • {formatDate(tx.date)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    tx.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {tx.type === 'expense' ? '-' : '+'}
                  {formatCurrency(tx.amount)}
                </span>
                {tx.type === 'payment' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLatestReceipt(tx.raw as any)}
                      title="Payment Receipt PDF (View & Download)"
                      className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 rounded-lg transition cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setLatestReceipt(tx.raw as any)}
                      title="Print Receipt"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {recentTransactions.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
              All financial entries currently show zero. Administrator can enter fresh payments and expenses using the buttons above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
