import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Announcement } from '../types';
import { formatDate } from '../utils/formatters';
import {
  Bell,
  PlusCircle,
  Edit2,
  Trash2,
  Pin,
  Calendar,
  X,
  Megaphone,
} from 'lucide-react';

export const Announcements: React.FC = () => {
  const { state, isAdmin, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [type, setType] = useState<Announcement['type']>('general');
  const [author, setAuthor] = useState('General Secretary');
  const [pinned, setPinned] = useState(false);

  const announcements = state.announcements || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title: title.trim(),
      titleUrdu: titleUrdu.trim(),
      content: content.trim(),
      date,
      type,
      author: author.trim(),
      pinned,
    });

    setTitle('');
    setTitleUrdu('');
    setContent('');
    setIsAddModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !editingAnn.title.trim()) return;

    updateAnnouncement(editingAnn.id, {
      title: editingAnn.title,
      titleUrdu: editingAnn.titleUrdu,
      content: editingAnn.content,
      date: editingAnn.date,
      type: editingAnn.type,
      author: editingAnn.author,
      pinned: editingAnn.pinned,
    });

    setEditingAnn(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            اعلانات و نوٹس بورڈ (Announcements & Notices)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official association circulars, funeral announcements, and meeting notices for Karachi & village
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
              ann.pinned ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {ann.pinned && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      ann.type === 'meeting'
                        ? 'bg-blue-100 text-blue-800'
                        : ann.type === 'death'
                        ? 'bg-purple-100 text-purple-800'
                        : ann.type === 'emergency'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ann.type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(ann.date)}</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {ann.title}
              </h3>
              {ann.titleUrdu && (
                <p className="text-sm font-urdu font-semibold text-emerald-800 mt-0.5">
                  {ann.titleUrdu}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-700 mt-2 whitespace-pre-line leading-relaxed">
                {ann.content}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Issued By: <span className="font-semibold text-slate-600">{ann.author}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingAnn(ann)}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No active announcements. Click "Post New Announcement" to publish circulars.
          </div>
        )}
      </div>

      {/* Add Announcement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Publish Announcement / نیا اعلان
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
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. General Body Meeting Karachi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Title (Urdu / اردو عنوان)
                </label>
                <input
                  type="text"
                  placeholder="مثال: کراچی میں جنرل باڈی کا اہم اجلاس"
                  value={titleUrdu}
                  onChange={(e) => setTitleUrdu(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-urdu text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Announcement['type'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="general">General (عام)</option>
                    <option value="meeting">Meeting (اجلاس)</option>
                    <option value="death">Condolence / Death (تعزیت / وفات)</option>
                    <option value="emergency">Emergency Relief (ہنگامی امداد)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Content / تفصیلی متن *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter complete notice or circular text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-semibold text-slate-800 text-xs">Pin to Top</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-md"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {editingAnn && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Edit Announcement
              </h3>
              <button
                onClick={() => setEditingAnn(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingAnn.title}
                  onChange={(e) => setEditingAnn({ ...editingAnn, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title (Urdu)</label>
                <input
                  type="text"
                  value={editingAnn.titleUrdu || ''}
                  onChange={(e) => setEditingAnn({ ...editingAnn, titleUrdu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-urdu"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={editingAnn.content}
                  onChange={(e) => setEditingAnn({ ...editingAnn, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="px-4 py-2 bg-slate-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
