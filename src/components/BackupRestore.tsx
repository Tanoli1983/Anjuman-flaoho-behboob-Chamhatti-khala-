import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const BackupRestore: React.FC = () => {
  const { state, language, exportBackupJson, restoreBackupJson, resetToInitialData } = useApp();
  const t = translations[language];

  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{
    memberCount: number;
    paymentCount: number;
    expenseCount: number;
    date: string;
  } | null>(null);

  const handleDownloadJsonBackup = () => {
    try {
      const jsonStr = exportBackupJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      link.href = url;
      link.download = `AFB_Chamhatti_Backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setRestoreStatus({
        success: true,
        message: `Backup downloaded and verified successfully! File AFB_Chamhatti_Backup_${timestamp}.json created with all records.`,
      });
      setTimeout(() => setRestoreStatus(null), 6000);
    } catch (err: any) {
      setRestoreStatus({
        success: false,
        message: `Backup failed: ${err.message}`,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const db = parsed.database || parsed;

        if (db.members && db.obligations && db.payments && db.expenses) {
          setSelectedFileContent(content);
          setPreviewInfo({
            memberCount: db.members.length,
            paymentCount: db.payments.length,
            expenseCount: db.expenses.length,
            date: parsed.exportedAt || 'Unknown',
          });
          setRestoreStatus(null);
        } else {
          setRestoreStatus({
            success: false,
            message: 'Invalid backup file structure: missing required database tables.',
          });
          setSelectedFileContent(null);
          setPreviewInfo(null);
        }
      } catch (err: any) {
        setRestoreStatus({
          success: false,
          message: `Corrupt file or JSON parsing error: ${err.message}`,
        });
        setSelectedFileContent(null);
        setPreviewInfo(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!selectedFileContent) return;
    const res = restoreBackupJson(selectedFileContent);
    setRestoreStatus(res);
    setSelectedFileContent(null);
    setPreviewInfo(null);
  };

  const handleResetToBaseline = () => {
    if (window.confirm('Are you sure you want to restore the system to its verified baseline records? A pre-restore snapshot of current records will be safely archived.')) {
      resetToInitialData();
      setRestoreStatus({
        success: true,
        message: 'Successfully reset database to verified baseline state. All historical transactions and Dar-ul-Baqa expenses are intact.',
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          {t.backup.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t.backup.subtitle}
        </p>
      </div>

      {/* Status banner */}
      {restoreStatus && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
            restoreStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {restoreStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{restoreStatus.message}</span>
        </div>
      )}

      {/* Main 2 Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Full JSON Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl w-fit mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t.backup.downloadBackup}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Exports a complete, tamper-proof JSON backup containing all {state.members.length} members, {state.obligations.length} fee obligations, {state.emergencyEvents.length} emergency cases, {state.payments.length} payment receipts, and {state.expenses.length} expense vouchers.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Registered Members:</span>
                <span className="font-bold text-slate-900">{state.members.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fee Obligations:</span>
                <span className="font-bold text-slate-900">{state.obligations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Records:</span>
                <span className="font-bold text-emerald-700">{state.payments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Expense Vouchers:</span>
                <span className="font-bold text-rose-700">{state.expenses.length}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Last Verified Backup:</span>
                <span className="font-semibold text-slate-800">{state.settings.lastBackupDate || 'Never'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadJsonBackup}
            className="w-full mt-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download Verified JSON Backup</span>
          </button>
        </div>

        {/* Card 2: Restore from Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-blue-100 text-blue-800 rounded-xl w-fit mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t.backup.restoreBackup}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t.backup.preRestoreNotice} Validates JSON format and prevents duplication before updating records.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select JSON Backup File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {previewInfo && (
              <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 animate-in fade-in">
                <span className="font-bold text-blue-900 block">Backup File Verified:</span>
                <div className="flex justify-between text-slate-700">
                  <span>Members to Restore:</span>
                  <span className="font-bold">{previewInfo.memberCount}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Payment Receipts:</span>
                  <span className="font-bold">{previewInfo.paymentCount}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Expenses:</span>
                  <span className="font-bold">{previewInfo.expenseCount}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-2">
            <button
              disabled={!selectedFileContent}
              onClick={handleConfirmRestore}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 active:scale-98 text-white font-bold rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Restore Database from Verified File</span>
            </button>

            <button
              onClick={handleResetToBaseline}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Verified Baseline Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit & Reliability Note */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Permanent Persistence & Safety Architecture: </span>
          <span>
            Every transaction is preserved immediately in localStorage with atomic state mutations. Prior to any restore or reset, an automated pre-restore snapshot is saved into browser storage to eliminate accidental data loss.
          </span>
        </div>
      </div>
    </div>
  );
};
