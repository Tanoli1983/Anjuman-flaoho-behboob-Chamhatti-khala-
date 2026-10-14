import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { OfficeBearer, OfficeBearerRoleCategory } from '../types';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  X,
  ShieldCheck,
  User,
} from 'lucide-react';

export const OfficeBearers: React.FC = () => {
  const { state, language, isAdmin, adminLogin, addOfficeBearer, updateOfficeBearer, deleteOfficeBearer } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBearer, setEditingBearer] = useState<OfficeBearer | null>(null);
  const [deletingBearerId, setDeletingBearerId] = useState<string | null>(null);

  // Quick Unlock Admin PIN state
  const [showInlinePin, setShowInlinePin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('صدر (President)');
  const [category, setCategory] = useState<OfficeBearerRoleCategory>('executive');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().substring(0, 10));
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [avatar, setAvatar] = useState('');
  const [notes, setNotes] = useState('');

  const standardRoles = [
    'صدر (President)',
    'نائب صدر (Vice President)',
    'جنرل سیکرٹری (General Secretary)',
    'جوائنٹ سیکرٹری (Joint Secretary)',
    'فنانس سیکرٹری (Finance Secretary)',
    'خزانچی (Treasurer)',
    'علاقائی عہدیدار (Regional Incharge)',
    'کمیٹی ممبر (Committee Member)',
    'دیگر عہدیدار (Other Office Bearer)',
  ];

  const officeBearers = state.settings.officeBearers || [];

  const filteredBearers = useMemo(() => {
    return officeBearers.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.role.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        (b.address && b.address.toLowerCase().includes(q));

      const matchesCat = categoryFilter === 'all' || b.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [officeBearers, searchQuery, categoryFilter]);

  const handleQuickUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = adminLogin(pinInput);
    if (ok) {
      setShowInlinePin(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Invalid Administrator Password. Please check or use Password Recovery in the top bar.');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    addOfficeBearer({
      name: name.trim(),
      role: role.trim(),
      category,
      phone: phone.trim(),
      address: address.trim(),
      appointmentDate,
      status,
      avatar: avatar.trim(),
      notes: notes.trim(),
    });

    setName('');
    setPhone('');
    setAddress('');
    setAvatar('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBearer || !editingBearer.name.trim()) return;

    updateOfficeBearer(editingBearer.id, {
      name: editingBearer.name,
      role: editingBearer.role,
      category: editingBearer.category,
      phone: editingBearer.phone,
      address: editingBearer.address,
      appointmentDate: editingBearer.appointmentDate,
      status: editingBearer.status,
      avatar: editingBearer.avatar,
      notes: editingBearer.notes,
    });

    setEditingBearer(null);
  };

  const handleDelete = (id: string) => {
    deleteOfficeBearer(id);
    setDeletingBearerId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            عہدیداران و انتظامیہ (Office Bearers Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage President, Secretary, Treasurer, Area Office-Bearers & Committee Members directly without touching code
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Office-Bearer</span>
          </button>
        ) : (
          <button
            onClick={() => setShowInlinePin(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Unlock Admin Controls</span>
          </button>
        )}
      </div>

      {/* Quick Unlock PIN Modal */}
      {showInlinePin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Enter Admin PIN</span>
              </h3>
              <button
                onClick={() => { setShowInlinePin(false); setPinError(''); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleQuickUnlock} className="mt-3 space-y-3">
              <p className="text-xs text-slate-600">
                Enter authorized Administrator PIN to enable full editing privileges (Default PIN: 1983).
              </p>
              <input
                type="password"
                autoFocus
                placeholder="Admin PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-emerald-500"
              />
              {pinError && <p className="text-xs text-rose-600 font-semibold">{pinError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInlinePin(false); setPinError(''); }}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-800"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Category Filter */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, designation, phone, address..."
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
          <option value="all">All Roles (تمام عہدے)</option>
          <option value="executive">Executive (صدر / سیکرٹری / نائب)</option>
          <option value="finance">Finance (خزانچی / فنانس)</option>
          <option value="area">Regional / Area (علاقائی عہدیداران)</option>
          <option value="committee">Committee Members (کمیٹی ممبران)</option>
          <option value="other">Other (دیگر)</option>
        </select>
      </div>

      {/* Office Bearers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredBearers.map((bearer) => (
          <div
            key={bearer.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-urdu text-sm font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {bearer.role}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    bearer.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {bearer.status}
                </span>
              </div>

              <div className="flex items-center gap-3 my-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-emerald-600/30 flex items-center justify-center shrink-0 shadow-inner text-emerald-800 font-bold text-lg overflow-hidden">
                  {bearer.avatar ? (
                    <img src={bearer.avatar} alt={bearer.name} className="w-full h-full object-cover" />
                  ) : (
                    bearer.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {bearer.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {bearer.category ? bearer.category.toUpperCase() : 'OFFICE BEARER'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                {bearer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{bearer.phone}</span>
                  </div>
                )}
                {bearer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{bearer.address}</span>
                  </div>
                )}
                {bearer.appointmentDate && (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Appointed: {bearer.appointmentDate}</span>
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingBearer(bearer)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingBearerId(bearer.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                  title="Remove Office Bearer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBearers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No office bearers match the selected criteria.
        </div>
      )}

      {/* Add Office Bearer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Add New Office-Bearer / نیا عہدیدار
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name / پورا نام *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Muhammad Ashraf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Designation / عہدہ *
                  </label>
                  <input
                    type="text"
                    required
                    list="standard-roles-list"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="standard-roles-list">
                    {standardRoles.map((r, i) => (
                      <option key={i} value={r} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as OfficeBearerRoleCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="executive">Executive</option>
                    <option value="finance">Finance</option>
                    <option value="area">Regional / Area</option>
                    <option value="committee">Committee Member</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number / رابطہ
                  </label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address (Karachi / Haripur)
                </label>
                <input
                  type="text"
                  placeholder="Mohallah / Area in Karachi or Chamhatti"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="active">Active (فعال)</option>
                  <option value="inactive">Inactive (سابقہ)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Photograph URL / Avatar (تصویر کا لنک)
                </label>
                <input
                  type="url"
                  placeholder="https://... (Optional image/photo URL)"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes / ذمہ داریاں
                </label>
                <input
                  type="text"
                  placeholder="e.g. Welfare committee, Cemetery supervisor, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-md"
                >
                  Save Office-Bearer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Office Bearer Modal */}
      {editingBearer && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Edit Office-Bearer Details / ترمیم عہدیدار
              </h3>
              <button
                onClick={() => setEditingBearer(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingBearer.name}
                  onChange={(e) => setEditingBearer({ ...editingBearer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / عہدہ *</label>
                  <input
                    type="text"
                    required
                    list="standard-roles-list-edit"
                    value={editingBearer.role}
                    onChange={(e) => setEditingBearer({ ...editingBearer, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <datalist id="standard-roles-list-edit">
                    {standardRoles.map((r, i) => (
                      <option key={i} value={r} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingBearer.category || 'executive'}
                    onChange={(e) => setEditingBearer({ ...editingBearer, category: e.target.value as OfficeBearerRoleCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="executive">Executive</option>
                    <option value="finance">Finance</option>
                    <option value="area">Regional / Area</option>
                    <option value="committee">Committee Member</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editingBearer.phone}
                    onChange={(e) => setEditingBearer({ ...editingBearer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingBearer.status}
                    onChange={(e) => setEditingBearer({ ...editingBearer, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="active">Active (فعال)</option>
                    <option value="inactive">Inactive (سابقہ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editingBearer.address || ''}
                  onChange={(e) => setEditingBearer({ ...editingBearer, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Photograph URL / Avatar (تصویر کا لنک)
                </label>
                <input
                  type="url"
                  placeholder="https://... (Optional image/photo URL)"
                  value={editingBearer.avatar || ''}
                  onChange={(e) => setEditingBearer({ ...editingBearer, avatar: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes / ذمہ داریاں
                </label>
                <input
                  type="text"
                  value={editingBearer.notes || ''}
                  onChange={(e) => setEditingBearer({ ...editingBearer, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBearer(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-md"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBearerId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Confirm Office-Bearer Removal</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove this office-bearer from the official association directory?
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeletingBearerId(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingBearerId)}
                className="px-4 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
