import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    budgetConfig,
    weeklySpent,
    weeklyEssential,
    weeklyLuxury,
    weeklyNeedsPercent,
    weeklyWantsPercent,
    weeklyCapSpentPercent,
    updateBudgetConfig,
    showToast,
  } = useFinance();

  // Week navigation state
  const [weekOffset, setWeekOffset] = useState(0); // 0 = This Week, -1 = Prev Week
  const [isAdjustGoalOpen, setIsAdjustGoalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState(budgetConfig.savingsGoal.title);
  const [goalTarget, setGoalTarget] = useState(budgetConfig.savingsGoal.targetAmount.toString());
  const [goalCurrent, setGoalCurrent] = useState(budgetConfig.savingsGoal.currentAmount.toString());

  // Dynamic AI Insight state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiInsight, setAiInsight] = useState({
    alert: 'Luxury spending is 18% higher than last week. Dining out accounted for $142 of your luxury spend.',
    pivot: 'Shifting 2 meals to home cooking could save you ~$65 next week toward your Tokyo Trip fund.',
    projectedSaving: 65,
  });

  const weekLabels = [
    { offset: -1, title: 'Week 41', dates: 'Oct 09 – Oct 15, 2024', isCurrent: false },
    { offset: 0, title: 'Week 42', dates: 'Oct 16 – Oct 22, 2024', isCurrent: true },
  ];

  const currentWeekInfo = weekLabels.find(w => w.offset === weekOffset) || weekLabels[1];

  // Daily distribution data for Mon to Sun
  const dailyDistribution = [
    { day: 'Mon', needs: 42, wants: 18, total: '$60' },
    { day: 'Tue', needs: 55, wants: 10, total: '$65' },
    { day: 'Wed', needs: 25, wants: 15, total: '$40' },
    { day: 'Thu', needs: 38, wants: 22, total: '$60' },
    { day: 'Fri', needs: 32, wants: 48, total: '$80' },
    { day: 'Sat', needs: 20, wants: 60, total: '$80' },
    { day: 'Sun', needs: 18, wants: 30, total: '$48' },
  ];

  // Categories breakdown
  const categoryBreakdown = [
    {
      name: 'Groceries & Essentials',
      type: 'Essential',
      count: '5 transactions',
      amount: 210.0,
      percent: '32.7%',
      icon: 'local_grocery_store',
      typeColor: 'bg-[#6bd8cb]/40 text-[#005049]',
    },
    {
      name: 'Restaurants & Bars',
      type: 'Luxury',
      count: '4 transactions',
      amount: 142.0,
      percent: '22.1%',
      icon: 'restaurant',
      typeColor: 'bg-[#ffdcc3] text-[#8d4b00]',
    },
    {
      name: 'Rent & Utilities',
      type: 'Essential',
      count: 'Weekly share',
      amount: 180.0,
      percent: '28.0%',
      icon: 'home_work',
      typeColor: 'bg-[#6bd8cb]/40 text-[#005049]',
    },
    {
      name: 'Entertainment & Subscriptions',
      type: 'Luxury',
      count: '2 services',
      amount: 88.1,
      percent: '13.7%',
      icon: 'movie',
      typeColor: 'bg-[#ffdcc3] text-[#8d4b00]',
    },
  ];

  // Generate / Refresh AI Insight
  const handleRefreshAiInsight = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/weekly-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essentialSpend: weeklyEssential,
          luxurySpend: weeklyLuxury,
          totalIncome: budgetConfig.monthlyIncome,
          topCategory: 'Restaurants & Bars',
          savingsGoalName: budgetConfig.savingsGoal.title,
          savingsGoalCurrent: budgetConfig.savingsGoal.currentAmount,
          savingsGoalTarget: budgetConfig.savingsGoal.targetAmount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsight(data);
        showToast('Generated fresh AI Pulse insight');
      }
    } catch {
      showToast('AI Pulse refreshed');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save Goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetConfig({
      savingsGoal: {
        title: goalTitle,
        targetAmount: parseFloat(goalTarget) || 5000,
        currentAmount: parseFloat(goalCurrent) || 3420,
      },
    });
    setIsAdjustGoalOpen(false);
  };

  // Export CSV summary
  const handleExportSummary = () => {
    const csvRows = [
      ['Date', 'Merchant', 'Category', 'Classification', 'Amount'],
      ...transactions.map(t => [
        t.date,
        `"${t.merchant.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        t.type,
        t.amount.toFixed(2),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aura_Weekly_Summary_${currentWeekInfo.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported weekly summary CSV!');
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-5 max-w-md mx-auto w-full">
      {/* Week Selector Carousel Bar */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between bg-[#f2f3ff] p-1.5 rounded-2xl shadow-sm border border-[#dae2fd]/40">
          <button
            aria-label="Previous week"
            onClick={() => setWeekOffset(-1)}
            disabled={weekOffset === -1}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              weekOffset === -1 ? 'opacity-30 cursor-not-allowed' : 'text-[#3d4947] hover:bg-[#eaedff] active:scale-90'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[16px] text-[#131b2e] tracking-tight">
                {currentWeekInfo.title}
              </span>
              {currentWeekInfo.isCurrent && (
                <span className="bg-[#00685f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  This Week
                </span>
              )}
            </div>
            <span className="text-[12px] text-[#3d4947]">{currentWeekInfo.dates}</span>
          </div>

          <button
            aria-label="Next week"
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              weekOffset === 0 ? 'opacity-30 cursor-not-allowed' : 'text-[#3d4947] hover:bg-[#eaedff] active:scale-90'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Metric Summary Bento Grid */}
      <section>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Spent Card (Span 2) */}
          <div className="col-span-2 bg-[#283044] text-white p-4 rounded-2xl shadow-md relative overflow-hidden border border-white/5">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#00685f]/30 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#dae2fd]/80">
                  Total Spent
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-numbers text-[30px] font-bold tracking-tight text-white">
                    ${weeklySpent.toFixed(2)}
                  </span>
                  <span className="font-mono-numbers text-[11px] bg-[#008378] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                    <span className="material-symbols-outlined text-[13px]">trending_down</span>
                    4% under cap
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#89f5e7]">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
            </div>

            {/* Weekly Cap Progress Bar */}
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[#dae2fd]/80 text-[12px]">
                <span>Weekly Cap: ${budgetConfig.weeklyCap.toFixed(2)}</span>
                <span className="font-mono-numbers text-[#89f5e7] font-semibold">
                  {weeklyCapSpentPercent}% spent
                </span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#89f5e7] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${weeklyCapSpentPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Income Utilized Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col justify-between border border-[#dae2fd]/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider">
                Income Utilized
              </span>
              <span className="material-symbols-outlined text-[#4e45d5] text-[20px]">pie_chart</span>
            </div>
            <div className="mt-2 flex flex-col">
              <span className="font-mono-numbers text-[20px] font-bold text-[#131b2e]">28.5%</span>
              <span className="text-[11px] text-[#3d4947] mt-0.5">of weekly allocation</span>
            </div>
          </div>

          {/* Net Saved Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col justify-between border border-[#dae2fd]/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider">
                Net Saved
              </span>
              <div className="w-6 h-6 rounded-full bg-[#6bd8cb]/40 flex items-center justify-center text-[#005049]">
                <span className="material-symbols-outlined text-[15px]">savings</span>
              </div>
            </div>
            <div className="mt-2 flex flex-col">
              <span className="font-mono-numbers text-[20px] font-bold text-[#00685f]">+$310.00</span>
              <span className="text-[11px] text-[#3d4947] mt-0.5">Transferred to Vault</span>
            </div>
          </div>
        </div>
      </section>

      {/* Needs vs Wants Daily Bar Visual */}
      <section>
        <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-3.5 border border-[#dae2fd]/40">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-[17px] text-[#131b2e]">Needs vs. Wants</h2>
              <p className="text-[12px] text-[#3d4947]">Daily distribution of spending type</p>
            </div>
            <span className="bg-[#eaedff] text-[#3d4947] font-mono-numbers text-[11px] font-semibold px-2.5 py-1 rounded-full">
              Target: 70/30
            </span>
          </div>

          {/* Ratio Bar Gauge */}
          <div className="flex flex-col gap-1.5 bg-[#f2f3ff] p-3 rounded-xl border border-[#dae2fd]/30">
            <div className="flex justify-between items-center text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
                <span className="font-medium text-[#131b2e]">{weeklyNeedsPercent}% Needs</span>
                <span className="font-mono-numbers text-[#3d4947]">(${weeklyEssential.toFixed(0)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono-numbers text-[#3d4947]">(${weeklyLuxury.toFixed(0)})</span>
                <span className="font-medium text-[#131b2e]">{weeklyWantsPercent}% Wants</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#b15f00]"></span>
              </div>
            </div>
            <div className="w-full h-3 bg-[#e2e7ff] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#00685f] transition-all duration-500"
                style={{ width: `${weeklyNeedsPercent}%` }}
              ></div>
              <div
                className="h-full bg-[#b15f00] transition-all duration-500"
                style={{ width: `${weeklyWantsPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Inline Bar Chart: Mon to Sun */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 h-36 px-1">
              {dailyDistribution.map(col => (
                <div
                  key={col.day}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                  title={`${col.day}: Needs ${col.needs}%, Wants ${col.wants}%`}
                >
                  <div className="w-full max-w-[28px] flex flex-col justify-end h-full gap-0.5">
                    {/* Top luxury portion */}
                    <div
                      className="w-full bg-[#b15f00] rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${col.wants}%` }}
                    ></div>
                    {/* Bottom essential portion */}
                    <div
                      className="w-full bg-[#00685f] rounded-b-sm transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${col.needs}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-medium text-[#3d4947] group-hover:text-[#131b2e]">
                    {col.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 pt-1 text-[#3d4947] text-[12px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#00685f]"></div>
              <span>Essential (Needs)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#b15f00]"></div>
              <span>Luxury (Wants)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Aura AI Pulse (AI Smart Financial Insights Card) */}
      <section>
        <div className="bg-gradient-to-br from-[#e2e7ff] via-[#eaedff] to-[#f2f3ff] p-4 rounded-2xl shadow-sm relative overflow-hidden border border-[#dae2fd]/60">
          <span className="material-symbols-outlined absolute -right-3 -top-3 text-[92px] text-[#4e45d5]/10 pointer-events-none select-none">
            auto_awesome
          </span>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#4e45d5] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
            </div>
            <span className="font-semibold text-[16px] text-[#131b2e]">Aura AI Pulse</span>
            <span className="ml-auto bg-[#e3dfff] text-[#100069] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Live Insight
            </span>
          </div>

          <div className="flex flex-col gap-2.5 text-[#131b2e]">
            {/* Alert Callout */}
            <div className="bg-white/85 backdrop-blur-sm p-3 rounded-xl flex items-start gap-2 shadow-sm border border-white/60">
              <span className="material-symbols-outlined text-[#b15f00] text-[20px] shrink-0 mt-0.5">
                trending_up
              </span>
              <p className="text-[13px] text-[#131b2e] leading-snug">
                {aiInsight.alert}
              </p>
            </div>

            {/* Actionable Recommendation */}
            <div className="bg-[#00685f]/10 p-3 rounded-xl flex items-start gap-2 border border-[#00685f]/15">
              <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0 mt-0.5">
                lightbulb
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00685f]">
                  Suggested Pivot
                </span>
                <p className="text-[12px] text-[#131b2e]">
                  {aiInsight.pivot}
                </p>
              </div>
            </div>

            {/* Micro Goal Visual Anchor with Photo Placeholders */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <img
                  className="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-white/50"
                  alt="Tokyo cityscape"
                  src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=200&auto=format&fit=crop"
                />
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-[#131b2e]">
                    {budgetConfig.savingsGoal.title}
                  </span>
                  <span className="font-mono-numbers text-[11px] font-medium text-[#00685f]">
                    ${budgetConfig.savingsGoal.currentAmount.toLocaleString()} / ${budgetConfig.savingsGoal.targetAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleRefreshAiInsight}
                  disabled={isGeneratingAi}
                  className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white text-[#00685f] flex items-center justify-center transition-all shadow-sm active:scale-95"
                  title="Regenerate AI Insight"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isGeneratingAi ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                </button>
                <button
                  onClick={() => setIsAdjustGoalOpen(true)}
                  className="bg-[#283044] hover:bg-[#1f2638] text-white text-[12px] font-medium px-3 py-1.5 rounded-lg active:scale-95 transition-transform shadow-sm"
                >
                  Adjust Target
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adjust Goal Modal */}
      {isAdjustGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveGoal} className="bg-white rounded-2xl p-5 max-w-sm w-full flex flex-col gap-3 shadow-xl">
            <h3 className="font-semibold text-[17px] text-[#131b2e]">Adjust Savings Goal</h3>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#3d4947]">Goal Name</label>
              <input
                type="text"
                value={goalTitle}
                onChange={e => setGoalTitle(e.target.value)}
                className="w-full px-3 h-10 rounded-xl bg-[#f2f3ff] text-[13px] text-[#131b2e] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#3d4947]">Current Saved ($)</label>
                <input
                  type="number"
                  value={goalCurrent}
                  onChange={e => setGoalCurrent(e.target.value)}
                  className="w-full px-3 h-10 rounded-xl bg-[#f2f3ff] text-[13px] font-mono-numbers text-[#131b2e] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#3d4947]">Target Goal ($)</label>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={e => setGoalTarget(e.target.value)}
                  className="w-full px-3 h-10 rounded-xl bg-[#f2f3ff] text-[13px] font-mono-numbers text-[#131b2e] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustGoalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#f2f3ff] text-[#3d4947] text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#00685f] text-white text-[13px] font-semibold"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Spending Categories Breakdown */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-[17px] text-[#131b2e]">Top Categories</h2>
            <span className="font-mono-numbers text-[12px] text-[#3d4947]">(4 this week)</span>
          </div>
          <span className="text-[12px] text-[#00685f] font-semibold">Live Breakdown</span>
        </div>

        <div className="flex flex-col gap-2">
          {categoryBreakdown.map(cat => (
            <div
              key={cat.name}
              className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm border border-[#dae2fd]/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#00685f] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[13px] text-[#131b2e] truncate">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full font-mono-numbers text-[10px] font-medium ${cat.typeColor}`}>
                      {cat.type}
                    </span>
                    <span className="text-[11px] text-[#3d4947]">{cat.count}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="font-mono-numbers text-[15px] font-bold text-[#131b2e]">
                  ${cat.amount.toFixed(2)}
                </span>
                <span className="font-mono-numbers text-[11px] text-[#3d4947]">
                  {cat.percent} of total
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Download Report / Share Pill Button */}
      <section className="pt-1">
        <button
          onClick={handleExportSummary}
          className="w-full h-12 bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#131b2e] font-semibold text-[14px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">ios_share</span>
          <span>Export Weekly Ledger Summary</span>
        </button>
      </section>
    </div>
  );
};
