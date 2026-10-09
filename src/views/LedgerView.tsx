import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ExpenseClassification, Transaction } from '../types';

export const LedgerView: React.FC = () => {
  const {
    transactions,
    rules,
    toggleRule,
    addRule,
    deleteTransaction,
    updateTransactionType,
    showToast,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'essential' | 'luxury' | 'income' | 'ai'>('all');
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  // Modal states
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [newRuleMerchant, setNewRuleMerchant] = useState('');
  const [newRuleTarget, setNewRuleTarget] = useState<ExpenseClassification>('Essential');

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    // Search match
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      tx.merchant.toLowerCase().includes(query) ||
      tx.category.toLowerCase().includes(query) ||
      (tx.notes && tx.notes.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Category filter match
    if (activeFilter === 'all') return true;
    if (activeFilter === 'essential') return tx.type === 'essential';
    if (activeFilter === 'luxury') return tx.type === 'luxury';
    if (activeFilter === 'income') return tx.type === 'income';
    if (activeFilter === 'ai') return tx.isAi === true;

    return true;
  });

  // Group by Date label
  const groupedByDate: { [key: string]: Transaction[] } = {};
  filteredTransactions.forEach(tx => {
    const key = tx.date;
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(tx);
  });

  const handleSaveNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleMerchant.trim()) return;

    addRule({
      merchant: newRuleMerchant.trim(),
      destination: newRuleTarget,
      subtitle: `Merchant Match · Custom Rule`,
      active: true,
    });

    setNewRuleMerchant('');
    setIsNewRuleModalOpen(false);
  };

  const outflowDisplay = period === 'week' ? '$492.15' : '$2,180.40';

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-5 max-w-md mx-auto w-full">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-[#6d7a77] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search transactions, merchants, tags..."
              className="w-full h-11 pl-10 pr-9 bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#6d7a77] text-[13px] rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f]/30 transition-all border border-[#dae2fd]/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 w-6 h-6 rounded-full bg-[#eaedff] flex items-center justify-center text-[#3d4947]"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </div>
          <button
            onClick={() => showToast('Filters active')}
            className="h-11 px-3.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#131b2e] gap-1 transition-colors active:scale-95 shrink-0 border border-[#dae2fd]/30"
          >
            <span className="material-symbols-outlined text-[19px] text-[#00685f]">tune</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-5 px-5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`shrink-0 h-7 px-3.5 rounded-full text-[12px] font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-[#131b2e] text-white shadow-sm'
                : 'bg-[#eaedff] text-[#3d4947] hover:bg-[#dae2fd]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('essential')}
            className={`shrink-0 h-7 px-3.5 rounded-full text-[12px] font-medium transition-all ${
              activeFilter === 'essential'
                ? 'bg-[#4e45d5] text-white shadow-sm'
                : 'bg-[#eaedff] text-[#3d4947] hover:bg-[#dae2fd]'
            }`}
          >
            Essential (Needs)
          </button>
          <button
            onClick={() => setActiveFilter('luxury')}
            className={`shrink-0 h-7 px-3.5 rounded-full text-[12px] font-medium transition-all ${
              activeFilter === 'luxury'
                ? 'bg-[#8d4b00] text-white shadow-sm'
                : 'bg-[#eaedff] text-[#3d4947] hover:bg-[#dae2fd]'
            }`}
          >
            Luxury (Wants)
          </button>
          <button
            onClick={() => setActiveFilter('income')}
            className={`shrink-0 h-7 px-3.5 rounded-full text-[12px] font-medium transition-all ${
              activeFilter === 'income'
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'bg-[#eaedff] text-[#3d4947] hover:bg-[#dae2fd]'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveFilter('ai')}
            className={`shrink-0 h-7 px-3.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-1 ${
              activeFilter === 'ai'
                ? 'bg-[#6860ef] text-white shadow-sm'
                : 'bg-[#eaedff] text-[#3d4947] hover:bg-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
            Flagged by AI
          </button>
        </div>
      </div>

      {/* Period & Metrics Segment */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#dae2fd]/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {/* Week vs Month */}
          <div className="bg-[#f2f3ff] p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                period === 'week'
                  ? 'bg-white text-[#131b2e] shadow-sm'
                  : 'text-[#3d4947] hover:text-[#131b2e]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                period === 'month'
                  ? 'bg-white text-[#131b2e] shadow-sm'
                  : 'text-[#3d4947] hover:text-[#131b2e]'
              }`}
            >
              Month
            </button>
          </div>

          <div className="flex items-center gap-1 text-[#3d4947]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Oct 2024</span>
            <span className="material-symbols-outlined text-[17px]">calendar_today</span>
          </div>
        </div>

        {/* Outflow & Inflow Tabular Summary */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-[12px] text-[#3d4947] block">Total Outflow</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-numbers text-[22px] font-bold text-[#131b2e] tracking-tight">
                {outflowDisplay}
              </span>
              <span className="text-[12px] text-[#00685f] flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> 4.2%
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[12px] text-[#3d4947] block">Monthly Inflow</span>
            <span className="font-mono-numbers text-[16px] text-[#00685f] font-bold mt-0.5 block">
              +$5,200.00
            </span>
          </div>
        </div>

        {/* Budget Progress Spark Line Bar */}
        <div className="w-full flex flex-col gap-1.5 pt-1">
          <div className="w-full h-2 bg-[#f2f3ff] rounded-full overflow-hidden flex">
            <div className="h-full bg-[#4e45d5] transition-all duration-500" style={{ width: '58%' }} title="Needs: 58%"></div>
            <div className="h-full bg-[#b15f00] transition-all duration-500" style={{ width: '24%' }} title="Wants: 24%"></div>
            <div className="h-full bg-[#dae2fd] transition-all duration-500" style={{ width: '18%' }} title="Buffer: 18%"></div>
          </div>
          <div className="flex justify-between items-center text-[#3d4947] text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4e45d5]"></span> 58% Needs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#b15f00]"></span> 24% Wants
            </span>
            <span>18% Remaining</span>
          </div>
        </div>
      </div>

      {/* Grouped Ledger Feed */}
      <div className="flex flex-col gap-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#dae2fd]/40">
            <span className="material-symbols-outlined text-[32px] text-[#6d7a77] mb-2">search_off</span>
            <h3 className="font-semibold text-[15px] text-[#131b2e]">No transactions match</h3>
            <p className="text-[12px] text-[#3d4947] mt-1">Try adjusting your search query or filter chip.</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, txs]) => {
            const dateSum = txs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

            return (
              <div key={date} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                    {date}
                  </span>
                  <span className={`font-mono-numbers text-[12px] font-medium ${dateSum >= 0 ? 'text-[#00685f]' : 'text-[#3d4947]'}`}>
                    {dateSum >= 0 ? `+$${dateSum.toFixed(2)} Net` : `-$${Math.abs(dateSum).toFixed(2)}`}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {txs.map(tx => {
                    const isIncome = tx.type === 'income';
                    const isLux = tx.type === 'luxury';

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="bg-white rounded-xl p-3 shadow-sm border border-[#dae2fd]/40 flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer hover:border-[#dae2fd]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-[#6bd8cb]/30 text-[#00685f]'
                                : isLux
                                ? 'bg-[#ffdcc3]/60 text-[#8d4b00]'
                                : 'bg-[#e2e7ff] text-[#4e45d5]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isIncome ? 'account_balance' : isLux ? 'brush' : 'directions_subway'}
                            </span>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[14px] text-[#131b2e] truncate">
                                {tx.merchant}
                              </span>
                              {tx.isAi && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4e45d5]" title="AI Classified"></span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] text-[#3d4947] truncate">
                                {tx.category}
                              </span>
                              <span
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-mono-numbers text-[10px] font-semibold leading-3 ${
                                  isIncome
                                    ? 'bg-[#89f5e7] text-[#00201d]'
                                    : isLux
                                    ? 'bg-[#ffdcc3] text-[#8d4b00]'
                                    : 'bg-[#eaedff] text-[#4e45d5]'
                                }`}
                              >
                                {tx.isAi && <span className="material-symbols-outlined text-[10px]">auto_awesome</span>}
                                {isIncome ? 'Income' : isLux ? 'Luxury' : 'Essential'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono-numbers text-[14px] font-bold ${
                              isIncome ? 'text-[#00685f]' : 'text-[#131b2e]'
                            }`}
                          >
                            {isIncome ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                          </span>
                          <span className="material-symbols-outlined text-[17px] text-[#bcc9c6]">
                            chevron_right
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Classification & AI Rules Section */}
      <section className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-[#4e45d5]">tune</span>
            <h2 className="font-semibold text-[17px] text-[#131b2e]">Classification & AI Rules</h2>
          </div>
          <span className="text-[11px] text-[#4e45d5] font-bold uppercase tracking-wider">
            {rules.filter(r => r.active).length} Active
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dae2fd]/40 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2 pb-1 border-b border-[#dae2fd]/30">
            <div>
              <span className="font-semibold text-[14px] text-[#131b2e]">Aura Auto-Engine</span>
              <p className="text-[12px] text-[#3d4947] mt-0.5">
                Learns your personal spending boundaries and enforces category routing automatically.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#e3dfff]/60 flex items-center justify-center text-[#4e45d5] shrink-0">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
          </div>

          {/* Rule Items */}
          <div className="flex flex-col gap-2">
            {rules.map(rule => {
              const isLux = rule.destination === 'Luxury';
              const isSplit = rule.destination === 'Auto Split AI';

              return (
                <div
                  key={rule.id}
                  className="bg-[#f2f3ff] p-3 rounded-xl flex items-center justify-between gap-2 border border-[#dae2fd]/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`material-symbols-outlined text-[18px] ${isLux ? 'text-[#8d4b00]' : isSplit ? 'text-[#00685f]' : 'text-[#4e45d5]'}`}>
                      {isLux ? 'local_cafe' : isSplit ? 'receipt_long' : 'medication'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[13px] font-medium text-[#131b2e] truncate">
                        <span>{rule.merchant}</span>
                        <span className="material-symbols-outlined text-[13px] text-[#6d7a77]">arrow_forward</span>
                        <span className={`font-semibold ${isLux ? 'text-[#8d4b00]' : isSplit ? 'text-[#00685f]' : 'text-[#4e45d5]'}`}>
                          Always {rule.destination}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#3d4947]">{rule.subtitle}</span>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rule.active}
                    onClick={() => toggleRule(rule.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none p-0.5 ${
                      rule.active ? 'bg-[#00685f]' : 'bg-[#bcc9c6]'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                        rule.active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Rule Button */}
          <button
            onClick={() => setIsNewRuleModalOpen(true)}
            className="w-full h-11 mt-1 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px] text-[#00685f]">add_circle</span>
            <span>+ New Classification Rule</span>
          </button>
        </div>
      </section>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3.5 shadow-2xl border border-[#dae2fd]/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[17px] text-[#131b2e]">{selectedTx.merchant}</h3>
                <span className="text-[12px] text-[#3d4947]">{selectedTx.category} • {selectedTx.date}</span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-[#eaedff] flex items-center justify-center text-[#3d4947]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#f2f3ff] flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#3d4947]">Amount</span>
              <span className="font-mono-numbers text-[20px] font-bold text-[#131b2e]">
                ${selectedTx.amount.toFixed(2)}
              </span>
            </div>

            {/* Classification switch */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider">Classification</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateTransactionType(selectedTx.id, 'essential');
                    setSelectedTx({ ...selectedTx, type: 'essential' });
                  }}
                  className={`py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    selectedTx.type === 'essential'
                      ? 'bg-[#4e45d5] text-white shadow-sm'
                      : 'bg-[#f2f3ff] text-[#3d4947]'
                  }`}
                >
                  Essential (Needs)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTransactionType(selectedTx.id, 'luxury');
                    setSelectedTx({ ...selectedTx, type: 'luxury' });
                  }}
                  className={`py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    selectedTx.type === 'luxury'
                      ? 'bg-[#8d4b00] text-white shadow-sm'
                      : 'bg-[#f2f3ff] text-[#3d4947]'
                  }`}
                >
                  Luxury (Wants)
                </button>
              </div>
            </div>

            {/* Itemized list if available */}
            {selectedTx.items && selectedTx.items.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider">
                  Itemized Items ({selectedTx.items.length})
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {selectedTx.items.map(item => (
                    <div key={item.id} className="flex justify-between text-[12px] bg-[#f2f3ff] p-2 rounded-lg">
                      <span className="text-[#131b2e] font-medium">{item.name}</span>
                      <span className="font-mono-numbers font-semibold text-[#131b2e]">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(selectedTx.id);
                  setSelectedTx(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-red-50 text-red-600 text-[12px] font-semibold hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#00685f] text-white text-[12px] font-semibold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Rule Modal */}
      {isNewRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveNewRule} className="bg-white rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3.5 shadow-2xl border border-[#dae2fd]/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[17px] text-[#131b2e]">Create Classification Rule</h3>
              <button
                type="button"
                onClick={() => setIsNewRuleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#eaedff] flex items-center justify-center text-[#3d4947]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider">
                If Merchant Matches
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Whole Foods, Spotify, Target"
                value={newRuleMerchant}
                onChange={e => setNewRuleMerchant(e.target.value)}
                className="w-full px-3.5 h-11 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f]/30"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#3d4947] uppercase tracking-wider">
                Assign Destination
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRuleTarget('Essential')}
                  className={`h-10 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    newRuleTarget === 'Essential'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'bg-[#f2f3ff] text-[#3d4947]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Essential
                </button>
                <button
                  type="button"
                  onClick={() => setNewRuleTarget('Luxury')}
                  className={`h-10 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    newRuleTarget === 'Luxury'
                      ? 'bg-[#8d4b00] text-white shadow-sm'
                      : 'bg-[#f2f3ff] text-[#3d4947]'
                  }`}
                >
                  Luxury
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#131b2e] text-white rounded-xl text-[14px] font-semibold active:scale-98 transition-transform mt-1 shadow-md"
            >
              Save & Apply Rule
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
