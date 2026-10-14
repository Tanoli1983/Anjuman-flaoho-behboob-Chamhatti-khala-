import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { runAccountingTestSuite, AccountingTestResult } from '../utils/accounting';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  X,
  FileCheck,
} from 'lucide-react';

interface AccountingTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountingTestsModal: React.FC<AccountingTestsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state } = useApp();
  const [testResults, setTestResults] = useState<AccountingTestResult[]>(() =>
    runAccountingTestSuite(state)
  );

  if (!isOpen) return null;

  const handleRunAllTests = () => {
    const results = runAccountingTestSuite(state);
    setTestResults(results);
  };

  const allPassed = testResults.every((t) => t.status === 'passed');
  const passedCount = testResults.filter((t) => t.status === 'passed').length;

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Official Accounting Audit & Test Suite
              </h3>
              <p className="text-xs text-slate-500">
                Automated verification of Tests A through K (Section 17 Requirements)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="my-3">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
              allPassed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {allPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-bold">
                {allPassed
                  ? `All 11 Standardized Accounting Tests PASSED (${passedCount}/11)`
                  : `${passedCount} of 11 Tests Passed`}
              </span>
            </div>

            <button
              onClick={handleRunAllTests}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold rounded-lg text-xs shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run All Tests</span>
            </button>
          </div>
        </div>

        {/* Tests List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 text-xs">
          {testResults.map((t) => (
            <div
              key={t.id}
              className={`p-3 rounded-xl border transition ${
                t.status === 'passed'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {t.name}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    t.status === 'passed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-slate-600 mb-2">{t.description}</p>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Expected: </span>
                  <span>{t.expected}</span>
                </div>
                <div className="text-emerald-700 font-bold">
                  <span className="font-semibold text-slate-700">Actual: </span>
                  <span>{t.actual}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 italic">
                {t.details}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close Audit Suite
          </button>
        </div>
      </div>
    </div>
  );
};
