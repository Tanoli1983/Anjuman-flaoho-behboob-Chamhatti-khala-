import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  BookOpen,
  Printer,
  ReceiptText,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';

interface MemberLedgerProps {
  initialMemberId?: string;
  onSelectMemberForPayment: (memberId: string) => void;
}

export const MemberLedger: React.FC<MemberLedgerProps> = ({
  initialMemberId,
  onSelectMemberForPayment,
}) => {
  const { state, language, getMemberSummary, setLatestReceipt } = useApp();
  const t = translations[language];

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    initialMemberId || state.members[0]?.id || ''
  );
  const [filterType, setFilterType] = useState<string>('all');

  const selectedMember = state.members.find((m) => m.id === selectedMemberId);
  const summary = selectedMember ? getMemberSummary(selectedMember.id) : null;

  // Build Chronological Ledger Entries
  const ledgerEntries = useMemo(() => {
    if (!selectedMember) return [];

    const entries: Array<{
      id: string;
      date: string;
      type: 'registration' | 'monthly' | 'emergency' | 'payment';
      title: string;
      debit: number; // Fee charged
      credit: number; // Payment received
      refNo?: string;
      paymentRecord?: any;
    }> = [];

    // 1. Obligations (Debits)
    const memberObligations = state.obligations.filter((o) => o.memberId === selectedMember.id);
    for (const obl of memberObligations) {
      if (filterType !== 'all' && obl.type !== filterType) continue;

      entries.push({
        id: obl.id,
        date: obl.createdAt.substring(0, 10),
        type: obl.type,
        title: obl.title,
        debit: obl.amountDue,
        credit: 0,
      });
    }

    // 2. Payments (Credits)
    const memberPayments = state.payments.filter(
      (p) => p.memberId === selectedMember.id && p.status !== 'reversed'
    );
    for (const pay of memberPayments) {
      if (pay.allocations && pay.allocations.length > 0) {
        const relevantAllocations =
          filterType === 'all'
            ? pay.allocations
            : pay.allocations.filter(
                (a) =>
                  a.type === filterType ||
                  (filterType === 'monthly' &&
                    (pay.paymentCategory === 'monthly' || pay.paymentCategory === 'annual_monthly'))
              );

        if (relevantAllocations.length > 0) {
          const creditSum = relevantAllocations.reduce((sum, a) => sum + a.amount, 0);
          const isAnnual = pay.paymentCategory === 'annual_monthly';
          entries.push({
            id: pay.id,
            date: pay.date,
            type: 'payment',
            title: isAnnual
              ? `Annual Monthly Fee (${pay.relevantPeriod || pay.allocations.length + ' months'})`
              : `Payment Received (${pay.allocations.map((a) => a.title).join(', ')})`,
            debit: 0,
            credit: creditSum,
            refNo: pay.receiptNumber,
            paymentRecord: pay,
          });
        }
      } else {
        if (
          filterType === 'all' ||
          filterType === pay.paymentCategory ||
          (filterType === 'monthly' && pay.paymentCategory === 'annual_monthly')
        ) {
          entries.push({
            id: pay.id,
            date: pay.date,
            type: 'payment',
            title:
              pay.paymentCategory === 'annual_monthly'
                ? `Annual Monthly Fee (${pay.relevantPeriod || '-'})`
                : `Payment Received (${pay.paymentCategory.toUpperCase()})`,
            debit: 0,
            credit: pay.amountReceived,
            refNo: pay.receiptNumber,
            paymentRecord: pay,
          });
        }
      }
    }

    // Sort chronologically
    return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedMember, state.obligations, state.payments, filterType]);

  const handleExportCsv = () => {
    if (!selectedMember) return;
    const headers = ['Date', 'Type', 'Description', 'Receipt / Ref #', 'Debit (PKR)', 'Credit (PKR)'];
    const rows = ledgerEntries.map((e) => [
      `"${e.date}"`,
      `"${e.type}"`,
      `"${e.title}"`,
      `"${e.refNo || '-'}"`,
      e.debit,
      e.credit,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute(
      'download',
      `Ledger_${selectedMember.id}_${selectedMember.fullName}_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.nav.ledger}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Individual statement of account, fee obligations, and receipts
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
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Member Selector Bar (Hidden in Print) */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between no-print">
        <div className="flex items-center gap-2 flex-1">
          <User className="w-4 h-4 text-emerald-700 shrink-0" />
          <label className="text-xs font-semibold text-slate-700 shrink-0">
            Select Member:
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {state.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.fullName} s/o {m.fatherName} ({m.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Category:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white font-medium text-slate-700"
          >
            <option value="all">All Fees & Payments</option>
            <option value="monthly">Monthly Fees Only</option>
            <option value="emergency">Emergency Fees Only</option>
            <option value="registration">Registration Fee Only</option>
          </select>
        </div>
      </div>

      {/* Selected Member Detail & Printable Statement Area */}
      {selectedMember && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print-container">
          {/* Printable Statement Header (Visible only in print or top of card) */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50">
            <div className="text-center pb-4 border-b border-slate-200 print-only">
              <h2 className="text-xl font-black text-emerald-950 uppercase">
                {state.settings.orgName}
              </h2>
              <h3 className="text-base font-bold text-emerald-800 font-urdu mt-0.5">
                {state.settings.orgNameUrdu}
              </h3>
              <p className="text-xs font-semibold text-emerald-900 mt-1">
                Registered Number: K/2018 DSW(4347) • رجسٹریشن نمبر: K/2018 DSW(4347)
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Member Account Statement • کھاتہ ممبر
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                    {selectedMember.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-200 text-slate-700">
                    {selectedMember.status}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedMember.fullName}
                </h3>
                <p className="text-sm text-slate-500">
                  ولد: {selectedMember.fatherName}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                  {selectedMember.mobile && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedMember.mobile}
                    </span>
                  )}
                  {selectedMember.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedMember.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Joined: {formatDate(selectedMember.joiningDate)}
                  </span>
                </div>
              </div>

              {/* Total Balance Card */}
              {summary && (
                <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs flex flex-col items-start md:items-end">
                  <span className="text-xs font-semibold text-slate-500">
                    Combined Outstanding Balance / کل بقایا
                  </span>
                  <div
                    className={`text-2xl sm:text-3xl font-extrabold mt-0.5 ${
                      summary.totalBalance > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(summary.totalBalance)}
                  </div>
                  <div className="mt-2 no-print">
                    <button
                      onClick={() => onSelectMemberForPayment(selectedMember.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <ReceiptText className="w-3.5 h-3.5" />
                      <span>Collect Fee Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Balances Breakdown (Monthly vs Emergency vs Registration) */}
          {summary && (
            <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-white text-center py-3 text-xs sm:text-sm">
              <div className="p-2">
                <span className="text-slate-500 block text-[11px]">Monthly Fees (ماہانہ فیس)</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  Due {formatCurrency(summary.monthlyDue)} • Paid {formatCurrency(summary.monthlyPaid)}
                </span>
                <span className={`text-xs font-extrabold ${summary.monthlyBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  Bal: {formatCurrency(summary.monthlyBalance)}
                </span>
              </div>

              <div className="p-2">
                <span className="text-slate-500 block text-[11px]">Emergency Fund (کفن دفن)</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  Due {formatCurrency(summary.emergencyDue)} • Paid {formatCurrency(summary.emergencyPaid)}
                </span>
                <span className={`text-xs font-extrabold ${summary.emergencyBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  Bal: {formatCurrency(summary.emergencyBalance)}
                </span>
              </div>

              <div className="p-2">
                <span className="text-slate-500 block text-[11px]">Registration (داخلہ فیس)</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  Due {formatCurrency(summary.registrationDue)} • Paid {formatCurrency(summary.registrationPaid)}
                </span>
                <span className={`text-xs font-extrabold ${summary.registrationBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  Bal: {formatCurrency(summary.registrationBalance)}
                </span>
              </div>
            </div>
          )}

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4">Date</th>
                  <th className="py-2.5 px-3 sm:px-4">Type</th>
                  <th className="py-2.5 px-3 sm:px-4">Description / Particulars</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Debit (Fee Due)</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Credit (Paid)</th>
                  <th className="py-2.5 px-3 sm:px-4 text-center no-print">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatDate(entry.date)}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          entry.type === 'payment'
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.type === 'monthly'
                            ? 'bg-blue-100 text-blue-800'
                            : entry.type === 'emergency'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-slate-800">
                      {entry.title}
                      {entry.refNo && (
                        <span className="text-xs text-slate-400 font-mono ml-1.5">
                          [#{entry.refNo}]
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center no-print">
                      {entry.paymentRecord && (
                        <button
                          onClick={() => setLatestReceipt(entry.paymentRecord)}
                          title="Payment Receipt PDF (View & Download)"
                          className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 rounded transition cursor-pointer"
                        >
                          <FileDown className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="py-3 px-3 sm:px-4 text-slate-800">
                    Grand Totals / کل حساب:
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right text-slate-900">
                    {formatCurrency(summary?.totalDue || 0)}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right text-emerald-700">
                    {formatCurrency(summary?.totalPaid || 0)}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-center text-xs no-print">
                    Bal: {formatCurrency(summary?.totalBalance || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Printable Signature Footers */}
          <div className="p-6 pt-12 mt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 print-only">
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                Treasurer / خزانچی
              </div>
              <p className="text-[10px] text-slate-400">Signature & Official Stamp</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                General Secretary / صدر
              </div>
              <p className="text-[10px] text-slate-400">Anjuman Falah-o-Bahbood Chamhatti Khala Butt Karachi</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
