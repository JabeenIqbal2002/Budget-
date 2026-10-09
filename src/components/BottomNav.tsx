import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf8ff]/90 backdrop-blur-xl border-t border-[#dae2fd]/50 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto h-16 px-3 flex items-center justify-around relative">
        {/* Today Tab */}
        <button
          onClick={() => setActiveTab('today')}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'today' ? 'text-[#00685f] font-semibold' : 'text-[#6d7a77] hover:text-[#131b2e]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'today' ? 'font-bold' : ''}`}>
            dashboard
          </span>
          <span className="text-[11px] leading-tight">Today</span>
        </button>

        {/* Ledger Tab */}
        <button
          onClick={() => setActiveTab('ledger')}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'ledger' ? 'text-[#00685f] font-semibold' : 'text-[#6d7a77] hover:text-[#131b2e]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'ledger' ? 'font-bold' : ''}`}>
            receipt_long
          </span>
          <span className="text-[11px] leading-tight">Ledger</span>
        </button>

        {/* Central Floating Action Button: AI Scanner */}
        <div className="flex items-center justify-center -translate-y-3.5">
          <button
            onClick={() => setActiveTab('scanner')}
            aria-label="AI Bill Scanner"
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-[0_8px_18px_rgba(0,104,95,0.32)] active:scale-90 ${
              activeTab === 'scanner'
                ? 'bg-[#005049] text-white ring-4 ring-[#89f5e7]/40 scale-105'
                : 'bg-[#00685f] hover:bg-[#008378] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">
              document_scanner
            </span>
          </button>
        </div>

        {/* Analytics Tab */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'analytics' ? 'text-[#00685f] font-semibold' : 'text-[#6d7a77] hover:text-[#131b2e]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'analytics' ? 'font-bold' : ''}`}>
            monitoring
          </span>
          <span className="text-[11px] leading-tight">Analytics</span>
        </button>

        {/* Budgets Tab */}
        <button
          onClick={() => setActiveTab('budgets')}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
            activeTab === 'budgets' ? 'text-[#00685f] font-semibold' : 'text-[#6d7a77] hover:text-[#131b2e]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'budgets' ? 'font-bold' : ''}`}>
            account_balance_wallet
          </span>
          <span className="text-[11px] leading-tight">Budgets</span>
        </button>
      </div>
    </nav>
  );
};
