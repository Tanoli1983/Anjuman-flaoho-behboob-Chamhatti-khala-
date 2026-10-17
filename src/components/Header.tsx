import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { formatCurrency } from '../utils/formatters';
import { Globe, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { Language } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenTests: () => void;
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTests, onOpenAdminLogin }) => {
  const { state, language, setLanguage, accountingSummary, isAdmin } = useApp();
  const t = translations[language];

  const languages: { code: Language; label: string }[] = [
    { code: 'ur', label: 'اردو' },
    { code: 'ur_roman', label: 'Roman Urdu' },
    { code: 'en', label: 'English' },
  ];

  const officialEnglishName = 'Anjuman Falah-o-Bahbood Chamhatti Khala Butt Karachi';
  const officialUrduName = 'انجمن فلاح و بہبود چمہٹی کھلابٹ کراچی';
  const officialRegistrationNumber = 'Registered Number: K/2018 DSW(4347)';
  const officialRegistrationNumberUrdu = 'رجسٹریشن نمبر: K/2018 DSW(4347)';

  const isUrdu = language === 'ur';

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Logo & Complete Responsive Org Title & Official Registration */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-700/90 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-amber-300 font-black text-sm sm:text-base tracking-wider">AFB</span>
            </div>
            <div className="min-w-0 flex-1">
              {isUrdu ? (
                <>
                  <h1 className="text-xs sm:text-sm md:text-base font-bold leading-tight text-white font-urdu break-words">
                    {state.settings.orgNameUrdu || officialUrduName}
                  </h1>
                  <div className="text-[11px] sm:text-xs text-amber-200/95 font-urdu font-medium leading-tight mt-0.5 break-words">
                    {state.settings.registrationNumberUrdu || officialRegistrationNumberUrdu}
                  </div>
                  <p className="text-[10px] sm:text-xs text-emerald-200/90 font-medium leading-tight mt-0.5 break-words">
                    {state.settings.orgName || officialEnglishName}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xs sm:text-sm md:text-base font-bold leading-tight text-white break-words">
                    {state.settings.orgName || officialEnglishName}
                  </h1>
                  <div className="text-[10px] sm:text-xs text-amber-200/95 font-medium leading-tight mt-0.5 tracking-wide break-words">
                    {state.settings.registrationNumber || officialRegistrationNumber}
                  </div>
                  <p className="text-[11px] sm:text-xs text-emerald-200/90 font-urdu font-medium leading-tight mt-0.5 break-words">
                    {state.settings.orgNameUrdu || officialUrduName}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Controls: Cash badge, PWA Install button, Language, Admin status, Test button */}
          <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 shrink-0 pt-1 md:pt-0 border-t border-emerald-700/50 md:border-t-0">
            {/* Quick Cash Balance Badge */}
            <div className="hidden lg:flex flex-col items-end px-2.5 py-1 bg-emerald-900/60 rounded-lg border border-emerald-700">
              <span className="text-[9px] text-emerald-300 font-medium uppercase tracking-wider">
                {t.dashboard.cashBalance}
              </span>
              <span className="text-xs font-bold text-white">
                {formatCurrency(accountingSummary.netCashBalance)}
              </span>
            </div>

            {/* PWA Mobile Install Button */}
            <PWAInstallButton variant="header" />

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
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-bold px-2 py-1.5 rounded-lg text-xs shadow transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Audit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
