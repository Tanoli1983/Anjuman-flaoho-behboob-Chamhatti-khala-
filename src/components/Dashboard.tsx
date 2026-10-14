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
  Clock,
  Printer,
} from 'lucide-react';

export const Dashboard: React.FC<{ onOpenTests: () => void }> = ({ onOpenTests }) => {
  const { state, language, accountingSummary, setActiveTab, setLatestReceipt } = useApp();
  const t = translations[language];

  // Calculate new members this month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const newMembersThisMonthCount = state.members.filter(m => m.joiningMonth === currentMonthStr).length;

  // Monthly fees stats
  let totalMonthlyDue = 0;
  let totalMonthlyCollected = 0;
  for (const obl of state.obligations) {
    if (obl.type === 'monthly') {
      totalMonthlyDue += Math.round(obl.amountDue);
      totalMonthlyCollected += Math.round(obl.amountPaid);
    }
  }

  // Emergency fees stats
  let totalEmergencyDue = 0;
  let totalEmergencyCollected = 0;
  for (const obl of state.obligations) {
    if (obl.type === 'emergency') {
      totalEmergencyDue += Math.round(obl.amountDue);
      totalEmergencyCollected += Math.round(obl.amountPaid);
    }
  }

  // Combine recent transactions (payments, expenses, incomes)
  const recentTransactions = [
    ...state.payments.slice(0, 8).map(p => ({
      id: p.id,
      type: 'payment' as const,
      title: `${p.memberName} (${p.receiptNumber})`,
      subtitle: p.allocations.map(a => a.title).join(', '),
      amount: p.amountReceived,
      date: p.date,
      status: p.status,
      raw: p,
    })),
    ...state.expenses.slice(0, 5).map(e => ({
      id: e.id,
      type: 'expense' as const,
      title: `${e.category} - ${e.paidTo}`,
      subtitle: e.description,
      amount: e.amount,
      date: e.date,
      status: e.status,
      raw: e,
    })),
    ...state.incomes.slice(0, 5).map(i => ({
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

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {state.settings.financialYear} • Chamhatti Khala Butt
            </span>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              {t.dashboard.title}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              {t.dashboard.subtitle}
            </p>
          </div>

          {/* Quick Cash Balance Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20 flex flex-col items-start md:items-end">
            <span className="text-xs font-medium text-emerald-200">
              {t.dashboard.cashBalance}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 tracking-tight">
              {formatCurrency(accountingSummary.netCashBalance)}
            </span>
            <span className="text-[11px] text-emerald-200/80 mt-1">
              {t.dashboard.openingBalance}: {formatCurrency(accountingSummary.openingBalance)}
            </span>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Main 4 KPI Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Cash Balance */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.cashBalance}</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-700">
              {formatCurrency(accountingSummary.netCashBalance)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Net In-Hand / Bank</span>
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
              Reg + Monthly + Emergency + Donations
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
              Dar-ul-Baqa & Cemetery Care
            </div>
          </div>
        </div>

        {/* Total Member Arrears */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.totalArrears}</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-700">
              {formatCurrency(accountingSummary.totalMemberArrears)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              Unpaid Member Obligations
            </div>
          </div>
        </div>
      </div>

      {/* Quick Operation Buttons (Mobile-first large touch targets) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>{t.dashboard.quickActions}</span>
          <span className="text-xs font-normal text-slate-500 font-urdu">فوری کارروائی</span>
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
            onClick={() => setActiveTab('emergency')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 active:scale-95 transition border border-purple-200/80 cursor-pointer font-semibold text-xs sm:text-sm"
          >
            <div className="p-2 rounded-lg bg-purple-700 text-white shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight">{t.emergency.recordDeathEvent}</div>
              <div className="text-[10px] text-purple-600 font-urdu">کفن دفن فنڈ</div>
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
              <div className="leading-tight">{t.expenses.addExpense}</div>
              <div className="text-[10px] text-rose-600 font-urdu">نیا خرچہ</div>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Metric Stats: Members, Monthly, Emergency, Registration */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Members Status */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600">{t.dashboard.totalMembers}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {state.members.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span className="text-emerald-600 font-medium">{accountingSummary.totalActiveMembers} Active</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{newMembersThisMonthCount} this month</span>
          </div>
        </div>

        {/* Monthly Fees Collected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.monthlyFeesCollected}</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {formatCurrency(totalMonthlyCollected)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Due: {formatCurrency(totalMonthlyDue)}</span>
            <span className="text-amber-600 font-medium">Bal: {formatCurrency(totalMonthlyDue - totalMonthlyCollected)}</span>
          </div>
        </div>

        {/* Emergency Fees Collected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.emergencyCollected}</span>
            <HeartHandshake className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {formatCurrency(totalEmergencyCollected)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Due: {formatCurrency(totalEmergencyDue)}</span>
            <span className="text-purple-600 font-medium">{state.emergencyEvents.length} Events</span>
          </div>
        </div>

        {/* Registration Fees & Donations */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">{t.dashboard.registrationFees}</span>
            <ReceiptText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {formatCurrency(accountingSummary.totalRegistrationFees)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Other: {formatCurrency(accountingSummary.totalDonationsAndOtherIncome)}</span>
            <span className="text-emerald-600 font-medium">PKR 100/reg</span>
          </div>
        </div>
      </div>

      {/* Accounting Verification Test Callout Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-slate-900 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              Audit & Accounting Verification Suite (Tests A to K)
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Verify exact PKR 79,700 expense math, PKR 200 new member rule, duplicate prevention, and zero arithmetic errors.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenTests}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-lg text-xs transition shrink-0 cursor-pointer text-center"
        >
          {t.tests.runAll}
        </button>
      </div>

      {/* Recent Transactions & Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{t.dashboard.recentTransactions}</span>
          </h3>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            View Full Ledger →
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
                  {tx.status === 'reversed' && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                      Reversed
                    </span>
                  )}
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
                  <button
                    onClick={() => setLatestReceipt(tx.raw as any)}
                    title="Print Receipt"
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Footer Status */}
      <div className="text-center text-xs text-slate-400 py-2">
        <span>{t.dashboard.lastBackup}: {state.settings.lastBackupDate || t.dashboard.noBackupYet}</span>
      </div>
    </div>
  );
};
