import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Member, MemberStatus } from '../types';
import {
  UserPlus,
  Search,
  BookOpen,
  ReceiptText,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Printer,
  X,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Archive,
  ShieldCheck,
} from 'lucide-react';

interface MembersProps {
  onSelectMemberForLedger: (memberId: string) => void;
  onSelectMemberForPayment: (memberId: string) => void;
}

export const Members: React.FC<MembersProps> = ({
  onSelectMemberForLedger,
  onSelectMemberForPayment,
}) => {
  const { state, language, isAdmin, addMember, updateMember, deleteMember, getMemberSummary } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [balanceFilter, setBalanceFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Form State for Add Member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberFatherName, setNewMemberFatherName] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberJoiningDate, setNewMemberJoiningDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [newMemberNotes, setNewMemberNotes] = useState('');

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return (state.members || []).filter((member) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        member.fullName.toLowerCase().includes(query) ||
        member.fatherName.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query) ||
        member.mobile.includes(query);

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      const summary = getMemberSummary(member.id);
      const hasBalance = summary ? summary.totalBalance > 0 : false;
      const matchesBalance =
        balanceFilter === 'all' ||
        (balanceFilter === 'has_balance' && hasBalance) ||
        (balanceFilter === 'cleared' && !hasBalance);

      return matchesSearch && matchesStatus && matchesBalance;
    });
  }, [state.members, searchQuery, statusFilter, balanceFilter, getMemberSummary]);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    addMember({
      fullName: newMemberName,
      fatherName: newMemberFatherName,
      mobile: newMemberMobile,
      address: newMemberAddress,
      joiningDate: newMemberJoiningDate,
      notes: newMemberNotes,
    });

    setNewMemberName('');
    setNewMemberFatherName('');
    setNewMemberMobile('');
    setNewMemberAddress('');
    setNewMemberNotes('');
    setIsAddModalOpen(false);
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMember(editingMember.id, {
      fullName: editingMember.fullName,
      fatherName: editingMember.fatherName,
      mobile: editingMember.mobile,
      address: editingMember.address,
      status: editingMember.status,
      notes: editingMember.notes,
    });

    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    deleteMember(id);
    setDeletingMemberId(null);
  };

  const handleExportCsv = () => {
    const headers = [
      'Member ID',
      'Full Name',
      'Father Name',
      'Mobile',
      'Address',
      'Joining Date',
      'Status',
      'Total Paid',
      'Total Balance',
    ];

    const rows = state.members.map((m) => {
      const s = getMemberSummary(m.id);
      return [
        `"${m.id}"`,
        `"${m.fullName}"`,
        `"${m.fatherName}"`,
        `"${m.mobile}"`,
        `"${m.address}"`,
        `"${m.joiningDate}"`,
        `"${m.status}"`,
        s?.totalPaid || 0,
        s?.totalBalance || 0,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AFB_Karachi_Members_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.members.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.members.subtitle} ({state.members.length} Registered Members)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{t.common.exportCsv}</span>
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
              <UserPlus className="w-4 h-4" />
              <span>{t.members.addNewMember}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, father name, member ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex gap-2">
            <select
              aria-label="Filter members by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status (تمام)</option>
              <option value="active">Active (فعال)</option>
              <option value="inactive">Inactive (غیر فعال)</option>
              <option value="deceased">Deceased (مرحوم)</option>
            </select>

            <select
              aria-label="Filter members by payment balance"
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Balances</option>
              <option value="has_balance">Has Balance (بقایا ہے)</option>
              <option value="cleared">Cleared (صاف)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredMembers.map((member) => {
          const summary = getMemberSummary(member.id);
          const hasBalance = summary ? summary.totalBalance > 0 : false;

          return (
            <div
              key={member.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                hasBalance ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Member Top Line: ID & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {member.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      member.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : member.status === 'deceased'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Name & Father Name */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {member.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  ولد: {member.fatherName || '-'}
                </p>

                {/* Contact details */}
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  {member.mobile && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.mobile}</span>
                    </div>
                  )}
                  {member.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Joined: {formatDate(member.joiningDate)}</span>
                  </div>
                </div>

                {/* Financial Summary Box */}
                {summary && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500">Total Paid:</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(summary.totalPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="font-semibold text-slate-700">Balance Due:</span>
                      <span
                        className={`font-bold text-sm ${
                          summary.totalBalance > 0 ? 'text-amber-700' : 'text-slate-800'
                        }`}
                      >
                        {formatCurrency(summary.totalBalance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => onSelectMemberForPayment(member.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <ReceiptText className="w-3.5 h-3.5" />
                  <span>Fee</span>
                </button>
                <button
                  onClick={() => onSelectMemberForLedger(member.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ledger</span>
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setEditingMember(member)}
                      title="Edit Member"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingMemberId(member.id)}
                      title="Delete Member"
                      className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No members found matching your search.
        </div>
      )}

      {/* Register New Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {t.members.addNewMember}
                </h3>
                <p className="text-xs text-slate-500">
                  New member registration (Registration Fee: Rs. 200, Monthly Fee: Rs. 100)
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs">
                <span className="font-bold block">Association Fee Rules:</span>
                <span>
                  New Member Registration Fee: Rs. {state.settings.registrationFee || 200} • Monthly Membership Fee: Rs. {state.settings.monthlyFee || 100} per month.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name / پورا نام *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Nadeem"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Father's Name / ولدیت *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ghulam Qadir"
                  value={newMemberFatherName}
                  onChange={(e) => setNewMemberFatherName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mobile Number / فون
                  </label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newMemberMobile}
                    onChange={(e) => setNewMemberMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Joining Date / تاریخ شمولیت *
                  </label>
                  <input
                    type="date"
                    required
                    value={newMemberJoiningDate}
                    onChange={(e) => setNewMemberJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Address (Karachi / Haripur)
                </label>
                <input
                  type="text"
                  placeholder="Area / Sector in Karachi or Chamhatti"
                  value={newMemberAddress}
                  onChange={(e) => setNewMemberAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional reference or notes"
                  value={newMemberNotes}
                  onChange={(e) => setNewMemberNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer transition shadow-md"
                >
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Edit Member Details ({editingMember.id})
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-3 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName}
                  onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Father's Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.fatherName}
                  onChange={(e) => setEditingMember({ ...editingMember, fatherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editingMember.mobile}
                    onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as MemberStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="active">Active (فعال)</option>
                    <option value="inactive">Inactive (غیر فعال)</option>
                    <option value="suspended">Suspended (معطل)</option>
                    <option value="deceased">Deceased (مرحوم)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={editingMember.address}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingMember.notes}
                  onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingMemberId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Confirm Member Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this member ({deletingMemberId})? This will permanently remove duplicate or incorrectly registered member records.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeletingMemberId(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMember(deletingMemberId)}
                className="px-4 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Yes, Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
