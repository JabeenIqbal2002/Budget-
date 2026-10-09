/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './views/TodayView';
import { LedgerView } from './views/LedgerView';
import { ScannerView } from './views/ScannerView';
import { AnalyticsView } from './views/AnalyticsView';
import { BudgetsView } from './views/BudgetsView';

const MainContent: React.FC = () => {
  const { activeTab, toastMessage } = useFinance();

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.03)] bg-[#faf8ff]">
        {/* Top App Bar */}
        <Header />

        {/* Dynamic View Component */}
        <main className="flex-1 w-full">
          {activeTab === 'today' && <TodayView />}
          {activeTab === 'ledger' && <LedgerView />}
          {activeTab === 'scanner' && <ScannerView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'budgets' && <BudgetsView />}
        </main>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#283044] text-white px-4 py-2.5 rounded-full text-[12px] font-medium flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/10 pointer-events-none">
            <span className="material-symbols-outlined text-[17px] text-[#89f5e7]">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Persistent Bottom Tab Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
