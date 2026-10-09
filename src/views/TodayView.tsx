import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { QuickExpenseDrawer } from '../components/QuickExpenseDrawer';

export const TodayView: React.FC = () => {
  const {
    transactions,
    budgetConfig,
    todaySpent,
    todayBudgetLeft,
    dailyPacePercent,
    weeklyEssential,
    weeklyLuxury,
    weeklyNeedsPercent,
    weeklyWantsPercent,
    monthlyTotalOutflow,
    monthlyIncomeAvailable,
    monthlyUtilizationPercent,
    setActiveTab,
    updateBudgetConfig,
  } = useFinance();

  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [isAdjustPaceOpen, setIsAdjustPaceOpen] = useState(false);
  const [paceInput, setPaceInput] = useState(budgetConfig.dailyBudget.toString());

  // Filter today's activity
  const todayTransactions = transactions
    .filter(t => t.date.includes('Oct 24') || t.date.includes('Today'))
    .slice(0, 5);

  // Circular gauge calculations (circumference for r=26 is ~163.36)
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (dailyPacePercent / 100) * circumference;

  const handleSavePace = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(paceInput);
    if (val && !isNaN(val) && val > 0) {
      updateBudgetConfig({ dailyBudget: val });
      setIsAdjustPaceOpen(false);
    }
  };

  const getCategoryIcon = (category: string, type: string) => {
    if (type === 'income') return 'payments';
    if (category.includes('Grocery') || category.includes('Produce')) return 'shopping_cart';
    if (category.includes('Restaurant') || category.includes('Coffee') || category.includes('Lunch')) return 'local_cafe';
    if (category.includes('Transport')) return 'directions_subway';
    if (category.includes('Rent') || category.includes('Utilities')) return 'home_work';
    if (category.includes('Personal') || category.includes('Wellness')) return 'brush';
    if (category.includes('Entertainment')) return 'movie';
    return 'receipt';
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-5 max-w-md mx-auto w-full">
      {/* Friendly Welcoming Header */}
      <section className="flex items-center justify-between pt-1">
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] text-[#3d4947] font-medium">Thursday, Oct 24</span>
          <h1 className="font-semibold text-[22px] text-[#131b2e] tracking-tight">
            Good afternoon, Sarah
          </h1>
        </div>
        <div className="relative shrink-0">
          <button 
            onClick={() => setActiveTab('budgets')}
            title="Mindful Balance"
            className="w-10 h-10 rounded-full bg-[#008378]/15 flex items-center justify-center text-[#00685f] transition-transform active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00685f] ring-2 ring-[#faf8ff]"></span>
        </div>
      </section>

      {/* Main Daily Spending Card: Tactile Hero Widget */}
      <section className="relative overflow-hidden rounded-2xl bg-white shadow-sm p-4 flex flex-col gap-3.5 border border-[#dae2fd]/40">
        {/* Ambient subtle glowing gradient blob */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#89f5e7]/35 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#dae2fd]/40 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                Daily Pace
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[32px] font-bold text-[#131b2e] tracking-tight font-mono-numbers">
                ${todayBudgetLeft.toFixed(2)}
              </span>
              <span className="text-[12px] font-medium text-[#3d4947] ml-1">left</span>
            </div>
            <p className="text-[12px] text-[#3d4947] mt-0.5">
              of <span className="font-semibold text-[#131b2e] font-mono-numbers">${budgetConfig.dailyBudget.toFixed(2)}</span> daily budget
            </p>
          </div>

          {/* Tactile Circular Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 64 64">
              <circle
                className="text-[#eaedff]"
                cx="32"
                cy="32"
                fill="none"
                r={radius}
                stroke="currentColor"
                strokeWidth="5.5"
              />
              <circle
                className="text-[#00685f] transition-all duration-700 ease-out"
                cx="32"
                cy="32"
                fill="none"
                r={radius}
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                strokeWidth="5.5"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono-numbers text-[12px] font-bold text-[#00685f]">
                {dailyPacePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Micro Safe Spending Meter */}
        <div className="relative z-10 flex flex-col gap-1.5 pt-0.5">
          <div className="w-full h-2 rounded-full bg-[#e2e7ff] overflow-hidden flex">
            <div
              className="h-full bg-[#00685f] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, 100 - dailyPacePercent))}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[#3d4947] text-[11px]">
            <span>Spent: ${todaySpent.toFixed(2)}</span>
            <span className="text-[#00685f] font-medium">
              {todayBudgetLeft > 20 ? 'On track for dinner • $4.25/hr' : 'Pacing moderate'}
            </span>
          </div>
        </div>

        {/* Quick Action / Add Expense Primary CTA */}
        <div className="relative z-10 flex items-center gap-2 pt-1">
          <button
            onClick={() => setIsQuickDrawerOpen(true)}
            className="flex-1 h-12 rounded-xl bg-[#283044] hover:bg-[#1f2638] text-white flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all font-semibold text-[14px]"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setIsAdjustPaceOpen(true)}
            aria-label="Adjust daily budget pace"
            className="w-12 h-12 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex items-center justify-center transition-colors active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>
      </section>

      {/* Adjust Daily Budget Modal */}
      {isAdjustPaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-4">
          <form onSubmit={handleSavePace} className="bg-white rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-xl">
            <h3 className="font-semibold text-[17px] text-[#131b2e]">Adjust Daily Budget Pace</h3>
            <p className="text-[12px] text-[#3d4947]">Set your daily spending target for discretionary expenses.</p>
            <div className="flex items-center px-4 h-12 rounded-xl bg-[#f2f3ff]">
              <span className="font-mono-numbers text-[20px] text-[#6d7a77] mr-1">$</span>
              <input
                type="number"
                step="5"
                value={paceInput}
                onChange={e => setPaceInput(e.target.value)}
                className="w-full bg-transparent font-mono-numbers text-[20px] font-semibold text-[#131b2e] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustPaceOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#3d4947] text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#00685f] text-white text-[13px] font-semibold"
              >
                Save Pace
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Action Pill Bar */}
      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-[#131b2e] shadow-sm shrink-0 active:scale-95 transition-all border border-[#dae2fd]/30"
        >
          <div className="w-6 h-6 rounded-full bg-[#6bd8cb]/40 text-[#005049] flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">document_scanner</span>
          </div>
          <span className="font-semibold text-[13px]">Scan Bill</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-[#131b2e] shadow-sm shrink-0 active:scale-95 transition-all border border-[#dae2fd]/30"
        >
          <div className="w-6 h-6 rounded-full bg-[#e3dfff]/70 text-[#4e45d5] flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">mic</span>
          </div>
          <span className="font-semibold text-[13px]">Voice / Note Log</span>
        </button>

        <button
          onClick={() => setIsQuickDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white text-[#131b2e] shadow-sm shrink-0 active:scale-95 transition-all border border-[#dae2fd]/30"
        >
          <div className="w-6 h-6 rounded-full bg-[#ffdcc3]/70 text-[#8d4b00] flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">call_split</span>
          </div>
          <span className="font-semibold text-[13px]">Split Bill</span>
        </button>
      </section>

      {/* Needs vs Wants Tracker (Essential vs Luxury) */}
      <section className="rounded-2xl bg-white shadow-sm p-4 flex flex-col gap-3.5 border border-[#dae2fd]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#4e45d5] text-[20px]">balance</span>
            <h2 className="font-semibold text-[17px] text-[#131b2e]">Weekly Balance</h2>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3d4947]">
            Needs vs Wants
          </span>
        </div>

        {/* Dual Segment Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-3 rounded-full bg-[#eaedff] overflow-hidden flex gap-0.5 p-0.5">
            <div
              className="h-full rounded-l-full bg-[#4e45d5] transition-all duration-500"
              style={{ width: `${weeklyNeedsPercent}%` }}
              title={`Essential Needs: ${weeklyNeedsPercent}%`}
            ></div>
            <div
              className="h-full rounded-r-full bg-[#b15f00] transition-all duration-500"
              style={{ width: `${weeklyWantsPercent}%` }}
              title={`Discretionary Luxury: ${weeklyWantsPercent}%`}
            ></div>
          </div>
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4e45d5]"></span>
              <span className="text-[11px] font-semibold text-[#131b2e]">{weeklyNeedsPercent}% Needs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b15f00]"></span>
              <span className="text-[11px] font-semibold text-[#131b2e]">{weeklyWantsPercent}% Wants</span>
            </div>
          </div>
        </div>

        {/* Two Insight Comparison Cards */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Essential Card */}
          <div className="rounded-xl bg-[#f2f3ff] p-3 flex flex-col justify-between gap-1 border border-[#dae2fd]/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#4e45d5] uppercase tracking-wide">
                Essential
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#4e45d5]">
                verified_user
              </span>
            </div>
            <div>
              <span className="font-mono-numbers text-[20px] font-bold text-[#131b2e]">
                ${weeklyEssential.toFixed(0)}
              </span>
              <span className="text-[11px] text-[#3d4947] block">this week</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#00685f]">trending_down</span>
              <span className="text-[11px] text-[#3d4947]">-4% vs target</span>
            </div>
          </div>

          {/* Luxury Card */}
          <div className="rounded-xl bg-[#f2f3ff] p-3 flex flex-col justify-between gap-1 border border-[#dae2fd]/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8d4b00] uppercase tracking-wide">
                Luxury
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#8d4b00]">
                celebration
              </span>
            </div>
            <div>
              <span className="font-mono-numbers text-[20px] font-bold text-[#131b2e]">
                ${weeklyLuxury.toFixed(0)}
              </span>
              <span className="text-[11px] text-[#3d4947] block">this week</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#8d4b00]">sentiment_satisfied</span>
              <span className="text-[11px] text-[#3d4947]">Calibrated safely</span>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Income Utilization Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-[#e2e7ff] to-[#dae2fd] shadow-sm p-4 flex flex-col gap-2.5 border border-[#dae2fd]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#00685f] text-[18px]">account_balance</span>
            <span className="font-semibold text-[14px] text-[#131b2e]">Monthly Income Utilization</span>
          </div>
          <span className="font-mono-numbers text-[12px] font-bold text-[#00685f]">
            {monthlyUtilizationPercent}% Used
          </span>
        </div>

        {/* Micro utilization horizontal progress */}
        <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full bg-[#00685f] rounded-full transition-all duration-700"
            style={{ width: `${monthlyUtilizationPercent}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-baseline gap-1">
            <span className="text-[#3d4947]">Total:</span>
            <span className="font-mono-numbers font-semibold text-[#131b2e]">
              ${budgetConfig.monthlyIncome.toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[#3d4947]">Available:</span>
            <span className="font-mono-numbers font-bold text-[#00685f]">
              ${monthlyIncomeAvailable.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* Today's Transactions Feed */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-[17px] text-[#131b2e]">Today's Activity</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] font-mono-numbers text-[11px] font-semibold text-[#3d4947]">
              {todayTransactions.length}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('ledger')}
            className="text-[12px] text-[#00685f] font-semibold hover:underline"
          >
            See All
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col border border-[#dae2fd]/40 divide-y divide-[#e2e7ff]">
          {todayTransactions.length === 0 ? (
            <div className="p-6 text-center text-[#6d7a77] text-[13px]">
              No transactions recorded today yet.
            </div>
          ) : (
            todayTransactions.map(tx => {
              const isIncome = tx.type === 'income';
              const isLux = tx.type === 'luxury';
              const iconName = getCategoryIcon(tx.category, tx.type);

              return (
                <div
                  key={tx.id}
                  onClick={() => setActiveTab('ledger')}
                  className="px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#f2f3ff]/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-[#6bd8cb]/30 text-[#00685f]'
                          : isLux
                          ? 'bg-[#ffdcc3]/50 text-[#8d4b00]'
                          : 'bg-[#eaedff] text-[#4e45d5]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {iconName}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[14px] text-[#131b2e] truncate">
                          {tx.merchant}
                        </span>
                        {/* Type badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono-numbers text-[10px] font-medium tracking-wide shrink-0 ${
                            isIncome
                              ? 'bg-[#89f5e7] text-[#005049]'
                              : isLux
                              ? 'bg-[#ffdcc3] text-[#8d4b00]'
                              : 'bg-[#e3dfff] text-[#4e45d5]'
                          }`}
                        >
                          {isIncome ? 'Income' : isLux ? 'Luxury' : 'Essential'}
                        </span>
                      </div>
                      <span className="text-[12px] text-[#3d4947] truncate">
                        {tx.merchantSubtitle || tx.category} • {tx.time}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono-numbers text-[15px] font-bold ${
                        isIncome ? 'text-[#00685f]' : 'text-[#131b2e]'
                      }`}
                    >
                      {isIncome ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Quick Expense Drawer Component */}
      <QuickExpenseDrawer
        isOpen={isQuickDrawerOpen}
        onClose={() => setIsQuickDrawerOpen(false)}
      />
    </div>
  );
};
