import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency } from '../utils/formatters';
import { Globe, ShieldCheck, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { Language, UserRole } from '../types';

interface HeaderProps {
  onOpenTests: () => void;
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTests, onOpenAdminLogin }) => {
  const { state, language, setLanguage, currentRole, setCurrentRole, accountingSummary, isAdmin } = useApp();
  const t = translations[language];

  const languages: { code: Language; label: string }[] = [
    { code: 'ur', label: 'اردو' },
    { code: 'ur_roman', label: 'Roman Urdu' },
    { code: 'en', label: 'English' },
  ];

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Org Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-emerald-200 font-bold text-base sm:text-lg">AFB</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-bold leading-tight truncate text-emerald-50">
                {state.settings.orgName}
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 font-urdu truncate leading-snug">
                {state.settings.orgNameUrdu}
              </p>
            </div>
          </div>

          {/* Controls: Cash badge, Language, Admin status, Test button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Cash Balance Badge */}
            <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-emerald-900/60 rounded-lg border border-emerald-700">
              <span className="text-[10px] text-emerald-300 font-medium uppercase tracking-wider">
                {t.dashboard.cashBalance}
              </span>
              <span className="text-xs font-bold text-white">
                {formatCurrency(accountingSummary.netCashBalance)}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-emerald-900/70 rounded-lg p-0.5 border border-emerald-700/60 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1.5 text-emerald-300 shrink-0 hidden sm:inline" />
              <select
                aria-label="Select Application Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-white font-medium text-xs px-2 py-1 rounded cursor-pointer focus:outline-none"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-800 text-white">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Security Badge */}
            <button
              onClick={onOpenAdminLogin}
              title={isAdmin ? 'Administrator Mode Active' : 'Click to Login as Admin'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs ${
                isAdmin
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700'
              }`}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Admin Login</span>
                </>
              )}
            </button>

            {/* Test Suite Button */}
            <button
              onClick={onOpenTests}
              title="Run Accounting Tests"
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-bold px-2.5 py-1.5 rounded-lg text-xs shadow transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Audit Tests</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
