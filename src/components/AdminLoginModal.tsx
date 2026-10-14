import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    isAdmin,
    isPasswordConfigured,
    adminLogin,
    adminLogout,
    setupInitialAdminPassword,
    updateAdminPin,
    recoverAdminPassword,
    resetAdminToSetupMode,
  } = useApp();

  // Mode states: 'login' | 'setup' | 'recover' | 'change'
  const [mode, setMode] = useState<'login' | 'setup' | 'recover' | 'change'>(() => {
    return isPasswordConfigured ? 'login' : 'setup';
  });

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Initial setup state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(
    state.settings.securityQuestion || 'What is the registered city of the Anjuman?'
  );
  const [customQuestion, setCustomQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Recovery state
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);

  // Change password state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [changeNewPasswordInput, setChangeNewPasswordInput] = useState('');
  const [changeConfirmPasswordInput, setChangeConfirmPasswordInput] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Feedback messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSecurityQuestion =
    state.settings.securityQuestion || 'What is the registered city of the Anjuman?';

  // 1. Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const success = adminLogin(passwordInput);
    if (success) {
      setSuccessMsg('Admin authentication successful! Full editing controls unlocked.');
      setTimeout(() => {
        onClose();
        setPasswordInput('');
      }, 900);
    } else {
      setErrorMsg('Incorrect Administrator Password. If you forgot your password, click "Forgot Password / Recovery" below.');
    }
  };

  // 2. Handle Initial Password Setup
  const handleInitialSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Password and confirmation do not match.');
      return;
    }

    const questionToSave = selectedQuestion === 'custom' ? customQuestion : selectedQuestion;
    const res = setupInitialAdminPassword(newPassword, questionToSave, securityAnswer);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
        setNewPassword('');
        setConfirmPassword('');
        setSecurityAnswer('');
      }, 1100);
    } else {
      setErrorMsg(res.message);
    }
  };

  // 3. Handle Password Recovery
  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (recoveryNewPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    const res = recoverAdminPassword(recoveryInput, recoveryNewPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
        setRecoveryInput('');
        setRecoveryNewPassword('');
        setRecoveryConfirmPassword('');
        setMode('login');
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  // 4. Handle Password Change (when logged in)
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (changeNewPasswordInput.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (changeNewPasswordInput !== changeConfirmPasswordInput) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    const res = updateAdminPin(currentPasswordInput, changeNewPasswordInput);
    if (res.success) {
      setSuccessMsg(res.message);
      setCurrentPasswordInput('');
      setChangeNewPasswordInput('');
      setChangeConfirmPasswordInput('');
      setMode('login');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150 my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {mode === 'setup'
                  ? 'Administrator Initial Password Setup'
                  : mode === 'recover'
                  ? 'Administrator Password Recovery'
                  : mode === 'change'
                  ? 'Change Administrator Password'
                  : 'Administrator Authentication'}
              </h3>
              <p className="text-xs text-slate-500 font-urdu">
                {mode === 'setup'
                  ? 'ایڈمنسٹریٹر کا محفوظ پاس ورڈ سیٹ کریں'
                  : mode === 'recover'
                  ? 'پاس ورڈ کی تصدیق و بحالی'
                  : 'انجمن فلاح و بہبود چمہٹی و کھلابٹ بٹ کراچی'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-900 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* ----------------- MODE: ALREADY LOGGED IN AS ADMIN ----------------- */}
        {isAdmin && mode !== 'change' ? (
          <div className="mt-4 space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Administrator Access Active</span>
                <span className="text-xs text-emerald-800">
                  You have full authorized privileges to add, edit, update, and delete members, office-bearers, payments, monthly fees, and expense records.
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Security Status:</span>
                <span className="font-bold text-emerald-700">Protected & Encrypted</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Key:</span>
                <span className="font-mono font-bold text-slate-800">
                  {state.settings.recoverySecretKey || 'AFB-RECOVER-2026'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('change')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition border border-slate-300"
              >
                <KeyRound className="w-4 h-4 text-slate-700" />
                <span>Change Administrator Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to reset the admin password? You will need to configure a new administrator password.'
                    )
                  ) {
                    resetAdminToSetupMode();
                    setMode('setup');
                  }
                }}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition border border-amber-200"
              >
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>Reset to Initial Password Setup Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  adminLogout();
                  onClose();
                }}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition border border-rose-200"
              >
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Logout from Admin Mode</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* ----------------- MODE: CHANGE PASSWORD ----------------- */}
        {isAdmin && mode === 'change' && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-slate-800">Update Administrator Password</span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Current Password / موجودہ پاس ورڈ *
              </label>
              <div className="relative">
                <input
                  type={showChangePassword ? 'text' : 'password'}
                  required
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg pr-9"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showChangePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                New Password / نیا پاس ورڈ (Minimum 4 characters) *
              </label>
              <input
                type={showChangePassword ? 'text' : 'password'}
                required
                value={changeNewPasswordInput}
                onChange={(e) => setChangeNewPasswordInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Confirm New Password / نئے پاس ورڈ کی تصدیق *
              </label>
              <input
                type={showChangePassword ? 'text' : 'password'}
                required
                value={changeConfirmPasswordInput}
                onChange={(e) => setChangeConfirmPasswordInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow cursor-pointer transition"
              >
                Save New Password
              </button>
            </div>
          </form>
        )}

        {/* ----------------- MODE: INITIAL SETUP ----------------- */}
        {!isAdmin && (mode === 'setup' || !isPasswordConfigured) && (
          <form onSubmit={handleInitialSetup} className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">
                  Welcome to Administrator Setup
                </span>
                <span>
                  As the authorized owner/office-bearer, please set your administrator password and recovery details now. Once configured, all management operations (Add, Edit, Update, Delete) are securely protected.
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Create Admin Password / پاس ورڈ بنائیں *
              </label>
              <div className="relative">
                <input
                  type={showSetupPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter secure password (min 4 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowSetupPassword(!showSetupPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm Password / پاس ورڈ کی تصدیق *
              </label>
              <input
                type={showSetupPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div className="border-t border-slate-200 pt-3">
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Security Recovery Question (پاس ورڈ ریکوری سوال)</span>
              </label>
              <select
                value={selectedQuestion}
                onChange={(e) => setSelectedQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
              >
                <option value="What is the registered city of the Anjuman?">
                  What is the registered city of the Anjuman? (Default: Karachi)
                </option>
                <option value="What is the official phone number of the Anjuman?">
                  What is the official phone number of the Anjuman?
                </option>
                <option value="What is the founding year of the Anjuman?">
                  What is the founding year of the Anjuman?
                </option>
                <option value="custom">Write custom question...</option>
              </select>

              {selectedQuestion === 'custom' && (
                <input
                  type="text"
                  required
                  placeholder="Type your security question"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl mt-2 text-xs"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Security Answer / جواب *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Karachi"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Used to instantly reset your password if you ever forget it.
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <span>Master Emergency Recovery Key:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                {state.settings.recoverySecretKey || 'AFB-RECOVER-2026'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save Password & Unlock Admin Mode</span>
            </button>

            {isPasswordConfigured && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-emerald-700 underline cursor-pointer"
                >
                  Already have password? Back to Login
                </button>
              </div>
            )}
          </form>
        )}

        {/* ----------------- MODE: STANDARD LOGIN ----------------- */}
        {!isAdmin && mode === 'login' && isPasswordConfigured && (
          <form onSubmit={handleLogin} className="mt-4 space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600 text-xs">
              Enter your configured administrator password to access management controls (Add, Edit, Update, and Delete) for members, office-bearers, payments, and expenses.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Administrator Password / پاس ورڈ *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter administrator password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Administrator Panel</span>
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('recover');
                }}
                className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot Password? / Recovery (پاس ورڈ بھول گئے؟)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('setup');
                }}
                className="text-slate-500 hover:text-slate-800 cursor-pointer text-[11px]"
              >
                Reset / Reconfigure
              </button>
            </div>
          </form>
        )}

        {/* ----------------- MODE: RECOVERY ----------------- */}
        {!isAdmin && mode === 'recover' && (
          <form onSubmit={handleRecovery} className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs">
              <span className="font-bold block mb-1">Secure Password Recovery:</span>
              <span>
                To verify your authorization, please answer your security question, enter the association emergency key (<strong className="font-mono">AFB-RECOVER-2026</strong>), or enter the official registered phone number.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Security Question: {currentSecurityQuestion}
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Enter answer, emergency key, or phone number"
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Tip: Default answer is &quot;Karachi&quot; or key &quot;AFB-RECOVER-2026&quot;
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Set New Password / نیا پاس ورڈ *
              </label>
              <div className="relative">
                <input
                  type={showRecoveryPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 4 characters"
                  value={recoveryNewPassword}
                  onChange={(e) => setRecoveryNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showRecoveryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm New Password / تصدیق نیا پاس ورڈ *
              </label>
              <input
                type={showRecoveryPassword ? 'text' : 'password'}
                required
                placeholder="Confirm new password"
                value={recoveryConfirmPassword}
                onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Reset Password</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
