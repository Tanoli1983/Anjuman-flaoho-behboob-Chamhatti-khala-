import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EmergencyEvent } from '../types';
import {
  HeartHandshake,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  X,
  AlertCircle,
  Users,
  CheckCircle2,
  ReceiptText,
} from 'lucide-react';

export const EmergencyFees: React.FC<{ onSelectMemberForPayment: (memberId: string) => void }> = ({
  onSelectMemberForPayment,
}) => {
  const { state, language, createEmergencyEvent } = useApp();
  const t = translations[language];

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    state.emergencyEvents[0]?.id || null
  );

  // Form State
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedRelation, setDeceasedRelation] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [description, setDescription] = useState('');
  const [feePerMember, setFeePerMember] = useState<number>(state.settings.emergencyFee || 100);
  const [funeralExpenseAmount, setFuneralExpenseAmount] = useState<number>(20000);
  const [funeralExpensePaidTo, setFuneralExpensePaidTo] = useState('');
  const [notes, setNotes] = useState('');

  const selectedEvent = state.emergencyEvents.find((e) => e.id === selectedEventId);

  // Compute live collection details for selected event
  const selectedEventObligations = state.obligations.filter(
    (o) => o.type === 'emergency' && o.emergencyEventId === selectedEvent?.id
  );

  const selectedEventTotalCollected = selectedEventObligations.reduce(
    (sum, o) => sum + Math.round(o.amountPaid),
    0
  );
  const selectedEventTotalDue = selectedEventObligations.reduce(
    (sum, o) => sum + Math.round(o.amountDue),
    0
  );

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deceasedName.trim()) return;

    const newEv = createEmergencyEvent({
      deceasedName,
      deceasedRelation,
      dateOfDeath,
      description,
      feePerMember,
      funeralExpenseAmount,
      funeralExpensePaidTo,
      notes,
    });

    setSelectedEventId(newEv.id);
    setIsEventModalOpen(false);

    // Reset Form
    setDeceasedName('');
    setDeceasedRelation('');
    setDescription('');
    setNotes('');
  };

  const handleExportCsv = () => {
    if (!selectedEvent) return;
    const headers = ['Event ID', 'Deceased Name', 'Member ID', 'Member Name', 'Fee Due', 'Paid', 'Status'];
    const rows = selectedEventObligations.map((o) => {
      const m = state.members.find((mem) => mem.id === o.memberId);
      return [
        `"${selectedEvent.id}"`,
        `"${selectedEvent.deceasedName}"`,
        `"${o.memberId}"`,
        `"${m?.fullName || '-'}"`,
        o.amountDue,
        o.amountPaid,
        `"${o.status}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Emergency_Event_${selectedEvent.id}_Report.csv`);
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
            {t.emergency.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.emergency.subtitle} (PKR {state.settings.emergencyFee || 100} / Death)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.emergency.recordDeathEvent}</span>
          </button>
        </div>
      </div>

      {/* Critical Example Callout (6 Deaths = 600 PKR per member) */}
      <div className="p-3.5 sm:p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs sm:text-sm text-purple-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Annual Accounting Rule (Test C): </span>
          <span>
            Each death is recorded as an independent event with its own fee obligation (e.g. 6 deaths in a year = 6 × PKR 100 = PKR 600 per eligible member). Historical event fees remain permanently intact.
          </span>
        </div>
      </div>

      {/* Events Selector & Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Events List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Recorded Death Events ({state.emergencyEvents.length})</span>
            <span className="text-xs text-purple-700 font-urdu">اموات و ہنگامی فنڈ</span>
          </h3>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {state.emergencyEvents.map((ev) => {
              const isSelected = ev.id === selectedEventId;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-purple-900">
                      {ev.id}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDate(ev.dateOfDeath)}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {ev.deceasedName}
                  </h4>
                  <div className="mt-2 text-xs flex justify-between text-slate-600">
                    <span>Fee: PKR {ev.feePerMember}</span>
                    <span className="font-semibold text-purple-800">
                      {ev.eligibleMemberCount} Members
                    </span>
                  </div>
                </div>
              );
            })}

            {state.emergencyEvents.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No death events recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Event Details & Collections Sheet */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          {selectedEvent ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                      {selectedEvent.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      Date: {formatDate(selectedEvent.dateOfDeath)}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {selectedEvent.deceasedName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {selectedEvent.description}
                  </p>
                </div>

                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold self-start sm:self-auto cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Event CSV</span>
                </button>
              </div>

              {/* Event Metrics Bar */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Total Due (Wajib)</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
                    {formatCurrency(selectedEventTotalDue)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedEventObligations.length} × PKR {selectedEvent.feePerMember}
                  </span>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-[11px] text-purple-700 block">Collected (Wasool)</span>
                  <span className="text-base sm:text-lg font-bold text-purple-800 block mt-0.5">
                    {formatCurrency(selectedEventTotalCollected)}
                  </span>
                  <span className="text-[10px] text-purple-600">Fund In-Hand</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[11px] text-amber-700 block">Outstanding</span>
                  <span className="text-base sm:text-lg font-bold text-amber-800 block mt-0.5">
                    {formatCurrency(Math.max(0, selectedEventTotalDue - selectedEventTotalCollected))}
                  </span>
                  <span className="text-[10px] text-amber-600">Unpaid Remainder</span>
                </div>
              </div>

              {/* Member Collection List for this Event */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
                <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 flex justify-between">
                  <span>Eligible Member Contribution Status</span>
                  <span>{selectedEventObligations.length} Eligible Members</span>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {selectedEventObligations.map((obl) => {
                    const mem = state.members.find((m) => m.id === obl.memberId);
                    return (
                      <div
                        key={obl.id}
                        className="p-2.5 flex items-center justify-between hover:bg-slate-50"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{mem?.fullName}</span>
                          <span className="text-slate-500 ml-1.5 font-mono">({obl.memberId})</span>
                          <span className="text-slate-400 block text-[11px]">ولد: {mem?.fatherName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              obl.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            Paid {formatCurrency(obl.amountPaid)} / {formatCurrency(obl.amountDue)}
                          </span>
                          {obl.status !== 'paid' ? (
                            <button
                              onClick={() => onSelectMemberForPayment(obl.memberId)}
                              className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Collect
                            </button>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Select or record an emergency event to view details.
            </div>
          )}
        </div>
      </div>

      {/* Record Death Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {t.emergency.recordDeathEvent}
                </h3>
                <p className="text-xs text-slate-500">
                  Record sad demise and apply emergency fund obligations across active members
                </p>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Name of Deceased Person / نام مرحوم *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marhoom Ghulam Muhammad s/o Noor Dad"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Death / تاریخ وفات *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOfDeath}
                    onChange={(e) => setDateOfDeath(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fee per Member (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={feePerMember}
                    onChange={(e) => setFeePerMember(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / تفصیل
                </label>
                <input
                  type="text"
                  placeholder="Funeral venue, cemetery location (e.g. Dar-ul-Baqa 2)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Related Funeral Relief Expense */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <span className="font-semibold text-purple-900 block text-xs">
                  Immediate Funeral / Assistance Expense (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-0.5">Relief Amount (PKR)</label>
                    <input
                      type="number"
                      value={funeralExpenseAmount}
                      onChange={(e) => setFuneralExpenseAmount(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">Paid To (Family/Driver)</label>
                    <input
                      type="text"
                      placeholder="e.g. Bereaved family"
                      value={funeralExpensePaidTo}
                      onChange={(e) => setFuneralExpensePaidTo(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-md"
                >
                  Record Event & Generate Obligations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
