/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Members } from './components/Members';
import { MonthlyFees } from './components/MonthlyFees';
import { EmergencyFees } from './components/EmergencyFees';
import { PaymentCollection } from './components/PaymentCollection';
import { IncomeManagement } from './components/IncomeManagement';
import { ExpenseManagement } from './components/ExpenseManagement';
import { MemberLedger } from './components/MemberLedger';
import { Reports } from './components/Reports';
import { BackupRestore } from './components/BackupRestore';
import { Settings } from './components/Settings';
import { OfficeBearers } from './components/OfficeBearers';
import { Announcements } from './components/Announcements';
import { ReceiptModal } from './components/ReceiptModal';
import { AccountingTestsModal } from './components/AccountingTestsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, latestReceipt, setLatestReceipt, language } = useApp();
  const [selectedLedgerMemberId, setSelectedLedgerMemberId] = useState<string>('');
  const [selectedPaymentMemberId, setSelectedPaymentMemberId] = useState<string>('');
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const isUrduRtl = language === 'ur';

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans ${isUrduRtl ? 'font-urdu' : ''}`}>
      {/* Top Header */}
      <Header 
        onOpenTests={() => setIsTestsModalOpen(true)} 
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Navigation Bar (Desktop & Mobile Drawer) */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'dashboard' && (
          <Dashboard onOpenTests={() => setIsTestsModalOpen(true)} />
        )}

        {activeTab === 'members' && (
          <Members
            onSelectMemberForLedger={(id) => {
              setSelectedLedgerMemberId(id);
              setActiveTab('ledger');
            }}
            onSelectMemberForPayment={(id) => {
              setSelectedPaymentMemberId(id);
              setActiveTab('payment');
            }}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyFees
            onSelectMemberForPayment={(id) => {
              setSelectedPaymentMemberId(id);
              setActiveTab('payment');
            }}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyFees
            onSelectMemberForPayment={(id) => {
              setSelectedPaymentMemberId(id);
              setActiveTab('payment');
            }}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentCollection
            initialMemberId={selectedPaymentMemberId}
            onPaymentSuccess={() => {}}
          />
        )}

        {activeTab === 'income' && <IncomeManagement />}

        {activeTab === 'expenses' && <ExpenseManagement />}

        {activeTab === 'ledger' && (
          <MemberLedger
            initialMemberId={selectedLedgerMemberId}
            onSelectMemberForPayment={(id) => {
              setSelectedPaymentMemberId(id);
              setActiveTab('payment');
            }}
          />
        )}

        {activeTab === 'reports' && (
          <Reports
            onSelectMemberForLedger={(id) => {
              setSelectedLedgerMemberId(id);
              setActiveTab('ledger');
            }}
          />
        )}

        {activeTab === 'officeBearers' && <OfficeBearers />}

        {activeTab === 'announcements' && <Announcements />}

        {activeTab === 'backup' && <BackupRestore />}

        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Official Receipt Modal (Triggered on any payment or print click) */}
      <ReceiptModal
        receipt={latestReceipt}
        onClose={() => setLatestReceipt(null)}
      />

      {/* Accounting Test Suite Modal (Tests A to K) */}
      <AccountingTestsModal
        isOpen={isTestsModalOpen}
        onClose={() => setIsTestsModalOpen(false)}
      />

      {/* Admin Authentication & PIN Management Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* PWA Offline Network Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
