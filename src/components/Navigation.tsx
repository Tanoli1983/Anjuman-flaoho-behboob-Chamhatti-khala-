import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  HeartHandshake,
  ReceiptText,
  BadgeDollarSign,
  TrendingDown,
  BookOpen,
  FileSpreadsheet,
  Database,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, language } = useApp();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'members', label: t.nav.members, icon: Users },
    { id: 'monthly', label: t.nav.monthlyFees, icon: CalendarCheck },
    { id: 'emergency', label: t.nav.emergencyFees, icon: HeartHandshake },
    { id: 'payment', label: t.nav.collectPayment, icon: ReceiptText, primary: true },
    { id: 'expenses', label: t.nav.expenses, icon: TrendingDown },
    { id: 'income', label: t.nav.income, icon: BadgeDollarSign },
    { id: 'ledger', label: t.nav.ledger, icon: BookOpen },
    { id: 'reports', label: t.nav.reports, icon: FileSpreadsheet },
    { id: 'backup', label: t.nav.backup, icon: Database },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  // Mobile Bottom Bar items (Top 4 most frequent tasks for an Android user)
  const mobilePrimaryTabs = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'members', label: t.nav.members, icon: Users },
    { id: 'payment', label: t.nav.collectPayment, icon: ReceiptText, primary: true },
    { id: 'monthly', label: t.nav.monthlyFees, icon: CalendarCheck },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop / Tablet Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-xs hidden md:block sticky top-14.5 z-20 no-print">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : tab.primary
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.primary ? 'text-amber-800' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Android optimized) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 shadow-lg no-print pb-safe">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {mobilePrimaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full w-full py-1 cursor-pointer transition ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'
                }`}
              >
                {tab.primary ? (
                  <div className="bg-emerald-600 text-white p-2 rounded-full shadow-md -mt-4 ring-4 ring-white">
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5 mb-0.5" />
                )}
                <span className="text-[10px] leading-tight text-center truncate max-w-full px-1">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More Menu Button for remaining tabs */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center h-full w-full py-1 cursor-pointer transition ${
              mobileMenuOpen ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 mb-0.5" /> : <Menu className="w-5 h-5 mb-0.5" />}
            <span className="text-[10px] leading-tight">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Full Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end no-print">
          <div className="bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-slate-800 text-base">Menu & Modules</h3>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-6">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left font-medium text-xs sm:text-sm cursor-pointer transition ${
                      isActive
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
