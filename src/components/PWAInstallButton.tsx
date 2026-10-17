import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle2, X, Share2, PlusSquare, ExternalLink } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone installed mode, show a small badge or hide
  if (isInstalled) {
    if (variant === 'banner') return null;
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          title="Install Anjuman on Android / Phone (Reg. K/2018 DSW(4347))"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold rounded-lg text-xs shadow-md transition cursor-pointer shrink-0 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-950" />
          <span className="hidden sm:inline">Install App</span>
          <span className="text-[11px] font-urdu sm:hidden">ایپ انسٹال</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 border border-emerald-600/60 rounded-2xl p-3.5 sm:p-4 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 my-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base leading-tight flex items-center gap-2">
                <span>Install Anjuman on Android</span>
                <span className="text-xs font-urdu text-amber-300 font-semibold">اینڈرائیڈ موبائل ایپ انسٹال کریں</span>
              </h4>
              <p className="text-xs text-emerald-200 mt-0.5">
                Reg: K/2018 DSW(4347) • Fast standalone mobile experience with offline ledger access and home screen launch.
              </p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow flex items-center justify-center gap-2 cursor-pointer transition shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Install Now / انسٹال کریں</span>
          </button>
        </div>
      )}

      {/* Installation Guide Modal (Android + iOS Instructions) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150 text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                    Anjuman Falah-o-Bahbood Chamhatti Khalabut Karachi
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-800">
                    Registered Number: K/2018 DSW(4347) • App: Anjuman
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Android Instructions */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Android Chrome / گوگل کروم پر انسٹالیشن:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-emerald-900 pr-1 leading-relaxed">
                  <li>
                    گوگل کروم براؤزر کے اوپری دائیں کونے میں <strong>تین ڈاٹس (⋮)</strong> پر ٹیپ کریں۔
                  </li>
                  <li>
                    مینو میں <strong>&quot;Install app&quot;</strong> یا <strong>&quot;Add to Home screen&quot;</strong> منتخب کریں۔
                  </li>
                  <li>
                    <strong>&quot;Install&quot;</strong> پر کلک کریں۔ ایپ آپ کی موبائل اسکرین پر محفوظ ہو جائے گی اور بغیر براؤزر بار کے عام ایپ کی طرح کھلے گی۔
                  </li>
                </ol>
              </div>

              {/* iOS Instructions */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>iPhone / iPad (Safari):</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Safari کے نیچے <strong>Share <Share2 className="w-3.5 h-3.5 inline mx-0.5" /></strong> بٹن پر ٹیپ کریں اور پھر <strong>&quot;Add to Home Screen&quot; <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" /></strong> پر کلک کریں۔
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                <span className="font-bold block">Standalone Mode:</span>
                <span>
                  انسٹال ہونے کے بعد انٹرنیٹ نہ ہونے پر بھی کیش شدہ ڈیٹا اور ممبران کا حساب کتاب دستیاب رہے گا۔
                </span>
              </div>

              {isInstallable && (
                <button
                  onClick={async () => {
                    const done = await install();
                    if (done) setShowGuide(false);
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Prompt Install Now / ابھی انسٹال کریں</span>
                </button>
              )}

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition"
              >
                Close / بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
