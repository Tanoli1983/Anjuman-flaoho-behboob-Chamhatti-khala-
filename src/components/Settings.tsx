import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Coins,
  Users,
  ShieldAlert,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { state, language, updateSettings } = useApp();
  const t = translations[language];

  const [orgName, setOrgName] = useState(state.settings.orgName);
  const [orgNameUrdu, setOrgNameUrdu] = useState(state.settings.orgNameUrdu);
  const [address, setAddress] = useState(state.settings.address);
  const [phone, setPhone] = useState(state.settings.phone);
  const [financialYear, setFinancialYear] = useState(state.settings.financialYear);
  const [monthlyFee, setMonthlyFee] = useState<number>(state.settings.monthlyFee);
  const [emergencyFee, setEmergencyFee] = useState<number>(state.settings.emergencyFee);
  const [registrationFee, setRegistrationFee] = useState<number>(state.settings.registrationFee);
  const [newMemberFirstMonthFee, setNewMemberFirstMonthFee] = useState<number>(state.settings.newMemberFirstMonthFee);
  const [receiptPrefix, setReceiptPrefix] = useState(state.settings.receiptPrefix);
  const [openingCashBalance, setOpeningCashBalance] = useState<number>(state.settings.openingCashBalance);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      orgName,
      orgNameUrdu,
      address,
      phone,
      financialYear,
      monthlyFee,
      emergencyFee,
      registrationFee,
      newMemberFirstMonthFee,
      receiptPrefix,
      openingCashBalance,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.settings.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">Settings updated and saved successfully!</span>
        </div>
      )}

      {/* Prospective Application Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-amber-950">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Prospective Application Rule: </span>
          <span>{t.settings.prospectiveNotice}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Org Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-200">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>Organization Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organization Name (English)
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organization Name (Urdu / اردو نام)
              </label>
              <input
                type="text"
                required
                value={orgNameUrdu}
                onChange={(e) => setOrgNameUrdu(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-urdu text-base font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Financial Year / مالی سال
              </label>
              <input
                type="text"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Phone / رابطہ نمبر
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Opening Cash Balance (PKR)
              </label>
              <input
                type="number"
                value={openingCashBalance}
                onChange={(e) => setOpeningCashBalance(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Address / پتہ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Fee Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-200">
            <Coins className="w-4 h-4 text-emerald-700" />
            <span>Default Fee Structure & Rates</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                {t.settings.monthlyFeeLabel}
              </label>
              <input
                type="number"
                min="0"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(parseInt(e.target.value, 10) || 100)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: PKR 100</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                {t.settings.emergencyFeeLabel}
              </label>
              <input
                type="number"
                min="0"
                value={emergencyFee}
                onChange={(e) => setEmergencyFee(parseInt(e.target.value, 10) || 100)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: PKR 100</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                {t.settings.regFeeLabel}
              </label>
              <input
                type="number"
                min="0"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(parseInt(e.target.value, 10) || 100)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Payable once</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                {t.settings.firstMonthFeeLabel}
              </label>
              <input
                type="number"
                min="0"
                value={newMemberFirstMonthFee}
                onChange={(e) => setNewMemberFirstMonthFee(parseInt(e.target.value, 10) || 100)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Initial month</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs sm:text-sm font-bold text-emerald-950">
            <span>Total Initial Payment for a New Member:</span>
            <span className="text-base text-emerald-800">
              PKR {registrationFee + newMemberFirstMonthFee} (Registration + First Month)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Receipt Number Prefix
              </label>
              <input
                type="text"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Generates receipts like {receiptPrefix}-2026-0001
              </span>
            </div>
          </div>
        </div>

        {/* Office-Bearers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-3 text-xs sm:text-sm">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-200">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Authorized Office-Bearers / مجاز عہدیداران</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.settings.officeBearers.map((ob) => (
              <div key={ob.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{ob.name}</span>
                  <span className="text-xs text-emerald-700 font-semibold">{ob.role}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{ob.phone}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl shadow-md cursor-pointer transition text-xs sm:text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save All Organization Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
