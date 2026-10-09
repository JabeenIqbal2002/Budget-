import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types';

export const Header: React.FC<{ onOpenProfile?: () => void }> = ({ onOpenProfile }) => {
  const { activeTab, setActiveTab } = useFinance();

  const getSubTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'today':
        return 'Today';
      case 'ledger':
        return 'Ledger';
      case 'scanner':
        return 'AI Scanner';
      case 'analytics':
        return 'Analytics';
      case 'budgets':
        return 'Budgets';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#faf8ff]/85 backdrop-blur-xl border-b border-[#dae2fd]/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto h-16 px-5 flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2.5 text-left focus:outline-none group active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00685f] to-[#008378] flex items-center justify-center text-white shadow-sm ring-1 ring-white/40">
              <span className="material-symbols-outlined text-[18px]">spa</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[17px] text-[#131b2e] tracking-tight leading-tight">
                Aura
              </span>
              <span className="text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider">
                {getSubTitle(activeTab)}
              </span>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            aria-label="Notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#3d4947] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors active:scale-95 relative"
            onClick={() => {
              // Quick alert feedback
            }}
          >
            <span className="material-symbols-outlined text-[21px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#00685f] ring-2 ring-[#faf8ff]"></span>
          </button>

          <button
            aria-label="User Profile & Settings"
            onClick={onOpenProfile || (() => setActiveTab('budgets'))}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eaedff] transition-transform active:scale-95"
            title="Profile & Budget Settings"
          >
            <img
              alt="Sarah"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e2e7ff]"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
