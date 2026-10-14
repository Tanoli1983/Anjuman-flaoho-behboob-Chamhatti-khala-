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
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    state,
    language,
    updateSettings,
    isAdmin,
    isPasswordConfigured,
    updateAdminPin,
    setupInitialAdminPassword,
    resetAdminToSetupMode,
  } = useApp();
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

  // Password & Security Management
  const [secCurrentPassword, setSecCurrentPassword] = useState('');
  const [secNewPassword, setSecNewPassword] = useState('');
  const [secConfirmPassword, setSecConfirmPassword] = useState('');
  const [secQuestion, setSecQuestion] = useState(
    state.settings.securityQuestion || 'What is the registered city of the Anjuman?'
  );
  const [secAnswer, setSecAnswer] = useState(state.settings.securityAnswer || 'Karachi');
  const [showSecPassword, setShowSecPassword] = useState(false);
  const [secFeedback, setSecFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

        {/* Administrator Security & Password Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Administrator Password & Security Management / ایڈمنسٹریٹر پاس ورڈ</span>
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isPasswordConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isPasswordConfigured ? 'Password Configured' : 'Setup Required'}
              </span>
              {isAdmin && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  Admin Logged In
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Authorized administrators use this password to unlock editing, updating, and deleting records (Members, Office-Bearers, Payments, Monthly Fees, and Expenses).
          </p>

          {secFeedback && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm ${
                secFeedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {secFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{secFeedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isPasswordConfigured && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Password / موجودہ پاس ورڈ *
                </label>
                <div className="relative">
                  <input
                    type={showSecPassword ? 'text' : 'password'}
                    value={secCurrentPassword}
                    onChange={(e) => setSecCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecPassword(!showSecPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSecPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password / نیا پاس ورڈ *
              </label>
              <input
                type={showSecPassword ? 'text' : 'password'}
                value={secNewPassword}
                onChange={(e) => setSecNewPassword(e.target.value)}
                placeholder="Min 4 characters"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password / تصدیق *
              </label>
              <input
                type={showSecPassword ? 'text' : 'password'}
                value={secConfirmPassword}
                onChange={(e) => setSecConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Security Recovery Question (پاس ورڈ ریکوری سوال)
              </label>
              <input
                type="text"
                value={secQuestion}
                onChange={(e) => setSecQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Security Recovery Answer (جواب)
              </label>
              <input
                type="text"
                value={secAnswer}
                onChange={(e) => setSecAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-600">
              Master Emergency Recovery Key (Keep confidential):
            </span>
            <span className="font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-300 text-slate-900">
              {state.settings.recoverySecretKey || 'AFB-RECOVER-2026'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to reset password settings back to setup mode?'
                  )
                ) {
                  resetAdminToSetupMode();
                  setSecFeedback({
                    type: 'success',
                    message:
                      'Admin password reset. Initial setup mode is now active.',
                  });
                }
              }}
              className="px-3 py-2 text-xs text-amber-700 hover:text-amber-900 border border-amber-200 bg-amber-50 rounded-xl flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Initial Setup Mode</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSecFeedback(null);
                if (secNewPassword.length < 4) {
                  setSecFeedback({
                    type: 'error',
                    message: 'New password must be at least 4 characters long.',
                  });
                  return;
                }
                if (secNewPassword !== secConfirmPassword) {
                  setSecFeedback({
                    type: 'error',
                    message: 'New password and confirmation do not match.',
                  });
                  return;
                }

                if (!isPasswordConfigured) {
                  const res = setupInitialAdminPassword(secNewPassword, secQuestion, secAnswer);
                  setSecFeedback({
                    type: res.success ? 'success' : 'error',
                    message: res.message,
                  });
                  if (res.success) {
                    setSecCurrentPassword('');
                    setSecNewPassword('');
                    setSecConfirmPassword('');
                  }
                } else {
                  const res = updateAdminPin(secCurrentPassword, secNewPassword, secQuestion, secAnswer);
                  setSecFeedback({
                    type: res.success ? 'success' : 'error',
                    message: res.message,
                  });
                  if (res.success) {
                    setSecCurrentPassword('');
                    setSecNewPassword('');
                    setSecConfirmPassword('');
                  }
                }
              }}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow cursor-pointer transition flex items-center gap-2 text-xs sm:text-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>Save Admin Password & Security</span>
            </button>
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
