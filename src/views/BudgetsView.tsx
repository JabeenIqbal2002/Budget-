import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export const BudgetsView: React.FC = () => {
  const { budgetConfig, updateBudgetConfig, setActiveTab, showToast } = useFinance();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1 state
  const [income, setIncome] = useState(budgetConfig.monthlyIncome);
  const [payFrequency, setPayFrequency] = useState(budgetConfig.payFrequency);
  const [showExtraStreams, setShowExtraStreams] = useState(false);
  const [extraStreamName, setExtraStreamName] = useState('');
  const [extraStreamAmount, setExtraStreamAmount] = useState('');

  // Step 2 state: Ratios
  const [needsPct, setNeedsPct] = useState(budgetConfig.needsRatio);
  const [luxuryPct, setLuxuryPct] = useState(budgetConfig.luxuryRatio);
  const [savingsPct, setSavingsPct] = useState(budgetConfig.savingsRatio);
  const [selectedPreset, setSelectedPreset] = useState(budgetConfig.frameworkPreset);

  // Dynamic calculations
  const dailyDiscretionaryAllowance = ((income * (luxuryPct / 100)) / 30).toFixed(2);
  const needsAmount = Math.round((income * needsPct) / 100);
  const luxuryAmount = Math.round((income * luxuryPct) / 100);
  const savingsAmount = Math.round((income * savingsPct) / 100);
  const runwayMonths = Math.max(1.0, (savingsAmount * 24) / (needsAmount || 1)).toFixed(1);

  const totalAllocated = needsPct + luxuryPct + savingsPct;

  // Preset selector
  const handleSelectPreset = (needs: number, luxury: number, savings: number, name: any) => {
    setNeedsPct(needs);
    setLuxuryPct(luxury);
    setSavingsPct(savings);
    setSelectedPreset(name);
  };

  // Auto-balancing slider drag
  const handleSliderChange = (changed: 'needs' | 'luxury' | 'savings', newVal: number) => {
    setSelectedPreset('Custom Ratio');

    if (changed === 'needs') {
      const clampedNeeds = Math.max(15, Math.min(85, newVal));
      const remainder = 100 - clampedNeeds;
      const otherTotal = luxuryPct + savingsPct || 1;
      const newLuxury = Math.max(5, Math.round((luxuryPct / otherTotal) * remainder));
      const newSavings = Math.max(5, remainder - newLuxury);

      setNeedsPct(clampedNeeds);
      setLuxuryPct(newLuxury);
      setSavingsPct(newSavings);
    } else if (changed === 'luxury') {
      const clampedLuxury = Math.max(5, Math.min(70, newVal));
      const remainder = 100 - clampedLuxury;
      const otherTotal = needsPct + savingsPct || 1;
      const newNeeds = Math.max(15, Math.round((needsPct / otherTotal) * remainder));
      const newSavings = Math.max(5, remainder - newNeeds);

      setNeedsPct(newNeeds);
      setLuxuryPct(clampedLuxury);
      setSavingsPct(newSavings);
    } else if (changed === 'savings') {
      const clampedSavings = Math.max(5, Math.min(65, newVal));
      const remainder = 100 - clampedSavings;
      const otherTotal = needsPct + luxuryPct || 1;
      const newNeeds = Math.max(15, Math.round((needsPct / otherTotal) * remainder));
      const newLuxury = Math.max(5, remainder - newNeeds);

      setNeedsPct(newNeeds);
      setLuxuryPct(newLuxury);
      setSavingsPct(clampedSavings);
    }
  };

  // Add extra stream
  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(extraStreamAmount);
    if (!extraStreamName.trim() || isNaN(amt) || amt <= 0) return;

    updateBudgetConfig({
      additionalIncomes: [
        ...budgetConfig.additionalIncomes,
        { id: `str-${Date.now()}`, name: extraStreamName.trim(), amount: amt },
      ],
      monthlyIncome: income + amt,
    });
    setIncome(prev => prev + amt);
    setExtraStreamName('');
    setExtraStreamAmount('');
    showToast(`Added ${extraStreamName} (+$${amt}/mo)`);
  };

  // Lock In & Enter Dashboard
  const handleLockIn = () => {
    const dailyCap = (income * (luxuryPct / 100)) / 30;
    const weeklyDiscretionaryCap = (income * (luxuryPct / 100)) / 4.33;

    updateBudgetConfig({
      monthlyIncome: income,
      payFrequency,
      needsRatio: needsPct,
      luxuryRatio: luxuryPct,
      savingsRatio: savingsPct,
      frameworkPreset: selectedPreset,
      dailyBudget: Math.round(dailyCap),
      weeklyCap: Math.round(weeklyDiscretionaryCap * 1.8), // total weekly outflow allowance
    });

    showToast('Budget locked in successfully!');
    setActiveTab('today');
  };

  // Contextual Assistant Copy
  let assistantAdvice =
    'Based on living costs in your area, keeping Luxury under 30% keeps you on track for vacation funds without feeling restrictive.';
  if (luxuryPct <= 22) {
    assistantAdvice =
      'High acceleration mode! You will build an extra 1.5 months of emergency runway every quarter.';
  } else if (luxuryPct >= 35) {
    assistantAdvice =
      'High flexibility allows spontaneous social activities. Aura will ping you if midweek dining exceeds pacing.';
  }

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-5 max-w-md mx-auto w-full">
      {/* Top Breadcrumb / Step Indicator */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
          <span className={`w-2 h-2 rounded-full ${currentStep === 2 ? 'bg-[#00685f]' : 'bg-[#bcc9c6]'}`}></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00685f] ml-1">
            Step {currentStep} of 2
          </span>
        </div>
        <span className="font-mono-numbers text-[12px] font-semibold text-[#3d4947]">
          {currentStep === 1 ? '50% completed' : '100% Onboarding'}
        </span>
      </div>

      {/* STEP 1: INCOME CONFIGURATION */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="font-bold text-[24px] text-[#131b2e] tracking-tight leading-tight">
              What's your monthly take-home income?
            </h1>
            <p className="text-[13px] text-[#3d4947] leading-relaxed">
              Aura calibrates your daily spending pace and smart expense limits based on your net earnings.
            </p>
          </div>

          {/* Income Input Hero Card */}
          <div className="w-full rounded-2xl bg-white shadow-sm p-5 border border-[#dae2fd]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d7a77]">
                Net Monthly Amount
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                Private
              </span>
            </div>

            {/* Live Editable Display */}
            <div className="flex items-baseline justify-center py-2 my-1">
              <span className="font-mono-numbers text-[32px] font-bold text-[#00685f] mr-1">$</span>
              <input
                type="number"
                value={income}
                onChange={e => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-48 text-center bg-transparent font-mono-numbers text-[36px] font-bold text-[#131b2e] focus:outline-none"
              />
              <span className="text-[14px] text-[#3d4947] ml-2 font-medium">/mo</span>
            </div>

            {/* Quick Step Incrementors */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIncome(prev => Math.max(0, prev - 500))}
                className="h-10 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] font-mono-numbers text-[12px] font-semibold text-[#131b2e] active:scale-95 transition-all"
              >
                -$500
              </button>
              <button
                type="button"
                onClick={() => setIncome(prev => Math.max(0, prev - 100))}
                className="h-10 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] font-mono-numbers text-[12px] font-semibold text-[#131b2e] active:scale-95 transition-all"
              >
                -$100
              </button>
              <button
                type="button"
                onClick={() => setIncome(prev => prev + 100)}
                className="h-10 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] font-mono-numbers text-[12px] font-semibold text-[#00685f] active:scale-95 transition-all"
              >
                +$100
              </button>
              <button
                type="button"
                onClick={() => setIncome(prev => prev + 500)}
                className="h-10 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] font-mono-numbers text-[12px] font-semibold text-[#00685f] active:scale-95 transition-all"
              >
                +$500
              </button>
            </div>

            {/* Estimated Daily Pace allowance */}
            <div className="mt-4 pt-3 flex items-center justify-between rounded-xl bg-[#f2f3ff] px-3.5 py-2.5 border border-[#dae2fd]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#89f5e7] flex items-center justify-center text-[#00685f]">
                  <span className="material-symbols-outlined text-[17px]">wb_sunny</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#3d4947]">
                    Estimated Daily Pace
                  </p>
                  <p className="text-[11px] text-[#6d7a77]">Safe discretionary pool</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono-numbers text-[16px] font-bold text-[#00685f]">
                  ~${((income * 0.46) / 30).toFixed(2)}
                </span>
                <span className="text-[11px] text-[#3d4947] ml-0.5">/day</span>
              </div>
            </div>
          </div>

          {/* Pay Frequency Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <label className="font-semibold text-[15px] text-[#131b2e]">Pay Frequency</label>
              <span className="text-[11px] text-[#6d7a77]">Synchronizes pacing</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { title: 'Bi-weekly', desc: 'Every 2 weeks (26/yr)' },
                { title: 'Monthly', desc: '1st or end of month' },
                { title: 'Twice a Month', desc: '15th and 30th (24/yr)' },
                { title: 'Irregular', desc: 'Freelance or variable' },
              ].map(freq => (
                <button
                  key={freq.title}
                  type="button"
                  onClick={() => setPayFrequency(freq.title as any)}
                  className={`flex flex-col items-start p-3 rounded-xl transition-all text-left border ${
                    payFrequency === freq.title
                      ? 'bg-[#00685f] text-white shadow-sm border-[#00685f]'
                      : 'bg-white text-[#131b2e] hover:bg-[#f2f3ff] border-[#dae2fd]/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-0.5">
                    <span className="font-semibold text-[13px]">{freq.title}</span>
                    {payFrequency === freq.title && (
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    )}
                  </div>
                  <span className={`text-[11px] ${payFrequency === freq.title ? 'text-white/80' : 'text-[#6d7a77]'}`}>
                    {freq.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Income Streams */}
          <div className="rounded-2xl bg-white shadow-sm p-4 border border-[#dae2fd]/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#e3dfff] flex items-center justify-center text-[#4e45d5]">
                  <span className="material-symbols-outlined text-[18px]">add_card</span>
                </div>
                <div>
                  <h2 className="font-semibold text-[13px] text-[#131b2e]">Additional Income</h2>
                  <p className="text-[11px] text-[#6d7a77]">Side gigs, investments, or dividends</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExtraStreams(!showExtraStreams)}
                className="h-8 px-3 rounded-full bg-[#e2e7ff] text-[#00685f] font-semibold text-[12px] flex items-center gap-1 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {showExtraStreams ? 'expand_less' : 'add'}
                </span>
                <span>{showExtraStreams ? 'Hide' : 'Add'}</span>
              </button>
            </div>

            {/* List and add form */}
            {showExtraStreams && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#dae2fd]/30">
                {budgetConfig.additionalIncomes.map(str => (
                  <div key={str.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#6d7a77] text-[16px]">work</span>
                      <span className="text-[13px] font-medium text-[#131b2e]">{str.name}</span>
                    </div>
                    <span className="font-mono-numbers text-[12px] font-bold text-[#00685f]">
                      +${str.amount}/mo
                    </span>
                  </div>
                ))}

                <form onSubmit={handleAddStream} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Stream name (e.g. Tutoring)"
                    value={extraStreamName}
                    onChange={e => setExtraStreamName(e.target.value)}
                    className="flex-1 px-3 h-9 rounded-lg bg-[#f2f3ff] text-[12px] focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="$ amount"
                    value={extraStreamAmount}
                    onChange={e => setExtraStreamAmount(e.target.value)}
                    className="w-24 px-2.5 h-9 rounded-lg bg-[#f2f3ff] text-[12px] font-mono-numbers focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 h-9 bg-[#00685f] text-white rounded-lg text-[12px] font-semibold"
                  >
                    Save
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Encryption Badge */}
          <div className="flex items-center justify-center gap-1.5 py-1 text-[#6d7a77] text-[11px] text-center">
            <span className="material-symbols-outlined text-[#00685f] text-[16px]">verified_user</span>
            <span>256-bit encrypted • Private & on-device calibration</span>
          </div>

          {/* Continue CTA */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="w-full h-12 rounded-xl bg-[#283044] hover:bg-[#1f2638] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span>Continue to Target Ratios</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* STEP 2: DEFINE ESSENTIAL VS LUXURY SPLIT */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="font-bold text-[24px] text-[#131b2e] tracking-tight leading-tight">
              Define your Essential vs. Luxury split
            </h1>
            <p className="text-[13px] text-[#3d4947] leading-relaxed">
              Choose how Aura automatically classifies your lifestyle expenses and alerts you before overspending.
            </p>
          </div>

          {/* Income Context Pill */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#eaedff] border border-[#dae2fd]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#dae2fd] flex items-center justify-center text-[#00685f]">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3d4947] block">
                  Monthly Base Income
                </span>
                <span className="font-mono-numbers text-[17px] font-bold text-[#131b2e]">
                  ${income.toLocaleString()}.00
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-3 py-1 rounded-full bg-white text-[#3d4947] hover:text-[#131b2e] text-[12px] font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <span>Edit</span>
              <span className="material-symbols-outlined text-[13px]">edit</span>
            </button>
          </div>

          {/* Segmented Live Gauge Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dae2fd]/40 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[15px] text-[#131b2e]">Allocation Split</span>
              <div className="flex items-center gap-1 bg-[#f2f3ff] px-2.5 py-0.5 rounded-full border border-[#dae2fd]/40">
                <span className="material-symbols-outlined text-[13px] text-[#00685f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span className={`font-mono-numbers text-[11px] font-bold ${totalAllocated === 100 ? 'text-[#00685f]' : 'text-red-600'}`}>
                  {totalAllocated}% Allocated
                </span>
              </div>
            </div>

            {/* Segmented Graphic Bar */}
            <div className="w-full h-3.5 bg-[#eaedff] rounded-full overflow-hidden flex p-0.5 gap-0.5">
              <div
                className="h-full bg-[#4e45d5] rounded-l-full transition-all duration-200 ease-out"
                style={{ width: `${needsPct}%` }}
              ></div>
              <div
                className="h-full bg-[#b15f00] transition-all duration-200 ease-out"
                style={{ width: `${luxuryPct}%` }}
              ></div>
              <div
                className="h-full bg-[#00685f] rounded-r-full transition-all duration-200 ease-out"
                style={{ width: `${savingsPct}%` }}
              ></div>
            </div>

            {/* Gauge Metric Cards Row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Needs */}
              <div className="flex flex-col p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/30">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#4e45d5] shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#6d7a77] uppercase truncate">Needs</span>
                </div>
                <span className="font-mono-numbers text-[14px] font-bold text-[#131b2e]">
                  ${needsAmount.toLocaleString()}
                </span>
                <span className="font-mono-numbers text-[11px] text-[#4e45d5] font-semibold">
                  {needsPct}%
                </span>
              </div>

              {/* Luxury */}
              <div className="flex flex-col p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/30">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#b15f00] shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#6d7a77] uppercase truncate">Luxury</span>
                </div>
                <span className="font-mono-numbers text-[14px] font-bold text-[#131b2e]">
                  ${luxuryAmount.toLocaleString()}
                </span>
                <span className="font-mono-numbers text-[11px] text-[#8d4b00] font-semibold">
                  {luxuryPct}%
                </span>
              </div>

              {/* Savings */}
              <div className="flex flex-col p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/30">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#00685f] shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#6d7a77] uppercase truncate">Savings</span>
                </div>
                <span className="font-mono-numbers text-[14px] font-bold text-[#131b2e]">
                  ${savingsAmount.toLocaleString()}
                </span>
                <span className="font-mono-numbers text-[11px] text-[#00685f] font-semibold">
                  {savingsPct}%
                </span>
              </div>
            </div>

            {/* Interactive Range Sliders */}
            <div className="border-t border-[#dae2fd]/40 pt-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                  Fine-Tune Allocations
                </span>
                <span className="text-[11px] text-[#6d7a77]">Slide to auto-balance</span>
              </div>

              {/* Slider 1: Needs */}
              <div className="flex flex-col gap-1 p-2 rounded-xl bg-[#f2f3ff]/60 border border-[#dae2fd]/30">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#131b2e] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4e45d5]"></span>
                    Essential Needs
                  </span>
                  <span className="font-mono-numbers font-bold text-[#4e45d5]">{needsPct}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={needsPct}
                  onChange={e => handleSliderChange('needs', parseInt(e.target.value))}
                  className="w-full h-2 bg-[#dae2fd] rounded-lg appearance-none cursor-pointer thumb-needs focus:outline-none"
                />
              </div>

              {/* Slider 2: Luxury */}
              <div className="flex flex-col gap-1 p-2 rounded-xl bg-[#f2f3ff]/60 border border-[#dae2fd]/30">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#131b2e] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#b15f00]"></span>
                    Luxury & Wants
                  </span>
                  <span className="font-mono-numbers font-bold text-[#8d4b00]">{luxuryPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={luxuryPct}
                  onChange={e => handleSliderChange('luxury', parseInt(e.target.value))}
                  className="w-full h-2 bg-[#dae2fd] rounded-lg appearance-none cursor-pointer thumb-wants focus:outline-none"
                />
              </div>

              {/* Slider 3: Savings */}
              <div className="flex flex-col gap-1 p-2 rounded-xl bg-[#f2f3ff]/60 border border-[#dae2fd]/30">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#131b2e] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
                    Vault & Savings
                  </span>
                  <span className="font-mono-numbers font-bold text-[#00685f]">{savingsPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="65"
                  value={savingsPct}
                  onChange={e => handleSliderChange('savings', parseInt(e.target.value))}
                  className="w-full h-2 bg-[#dae2fd] rounded-lg appearance-none cursor-pointer thumb-savings focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Recommended Framework Presets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                Recommended Frameworks
              </span>
              <span className="text-[12px] text-[#00685f]">Dynamic Balance</span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Preset 1: Balanced Aura */}
              <button
                type="button"
                onClick={() => handleSelectPreset(50, 30, 20, 'Balanced Aura')}
                className={`p-3.5 rounded-2xl bg-white shadow-sm flex items-center justify-between text-left transition-all border ${
                  selectedPreset === 'Balanced Aura'
                    ? 'border-[#00685f] ring-2 ring-[#00685f]/20'
                    : 'border-[#dae2fd]/40 hover:bg-[#f2f3ff]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedPreset === 'Balanced Aura' ? 'bg-[#00685f] text-white' : 'bg-[#e2e7ff]'
                    }`}
                  >
                    {selectedPreset === 'Balanced Aura' && (
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-[14px] text-[#131b2e]">Balanced Aura</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#005049] text-[10px] font-bold uppercase">
                        Recommended
                      </span>
                    </div>
                    <span className="text-[12px] text-[#6d7a77]">
                      50% Essential · 30% Luxury · 20% Vault
                    </span>
                  </div>
                </div>
                <span className="font-mono-numbers text-[12px] font-bold text-[#131b2e] shrink-0">
                  50/30/20
                </span>
              </button>

              {/* Preset 2: Aggressive Saver */}
              <button
                type="button"
                onClick={() => handleSelectPreset(60, 20, 20, 'Aggressive Saver')}
                className={`p-3.5 rounded-2xl bg-white shadow-sm flex items-center justify-between text-left transition-all border ${
                  selectedPreset === 'Aggressive Saver'
                    ? 'border-[#00685f] ring-2 ring-[#00685f]/20'
                    : 'border-[#dae2fd]/40 hover:bg-[#f2f3ff]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedPreset === 'Aggressive Saver' ? 'bg-[#00685f] text-white' : 'bg-[#e2e7ff]'
                    }`}
                  >
                    {selectedPreset === 'Aggressive Saver' && (
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-[14px] text-[#131b2e]">Aggressive Saver</span>
                    <span className="text-[12px] text-[#6d7a77] block">
                      60% Essential · 20% Luxury · 20% Vault
                    </span>
                  </div>
                </div>
                <span className="font-mono-numbers text-[12px] font-bold text-[#131b2e] shrink-0">
                  60/20/20
                </span>
              </button>

              {/* Preset 3: Flex Lifestyle */}
              <button
                type="button"
                onClick={() => handleSelectPreset(50, 40, 10, 'Flex Lifestyle')}
                className={`p-3.5 rounded-2xl bg-white shadow-sm flex items-center justify-between text-left transition-all border ${
                  selectedPreset === 'Flex Lifestyle'
                    ? 'border-[#00685f] ring-2 ring-[#00685f]/20'
                    : 'border-[#dae2fd]/40 hover:bg-[#f2f3ff]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedPreset === 'Flex Lifestyle' ? 'bg-[#00685f] text-white' : 'bg-[#e2e7ff]'
                    }`}
                  >
                    {selectedPreset === 'Flex Lifestyle' && (
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-[14px] text-[#131b2e]">Flex Lifestyle</span>
                    <span className="text-[12px] text-[#6d7a77] block">
                      50% Essential · 40% Luxury · 10% Vault
                    </span>
                  </div>
                </div>
                <span className="font-mono-numbers text-[12px] font-bold text-[#131b2e] shrink-0">
                  50/40/10
                </span>
              </button>
            </div>
          </div>

          {/* AI Smart Assistant Insight Box */}
          <div className="p-4 rounded-2xl bg-[#f2f3ff] shadow-sm flex items-start gap-3 border border-[#dae2fd]/50">
            <div className="w-8 h-8 rounded-full bg-[#89f5e7] flex items-center justify-center text-[#00685f] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[17px]">psychology</span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00685f]">
                  Aura Smart Assistant
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]"></span>
              </div>
              <p className="text-[12px] text-[#131b2e] leading-relaxed">
                {assistantAdvice}
              </p>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#dae2fd]/40">
              <div className="flex items-center gap-1.5 text-[#3d4947] mb-1">
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Daily Luxury Cap</span>
              </div>
              <div>
                <div className="font-mono-numbers text-[18px] font-bold text-[#131b2e]">
                  ${dailyDiscretionaryAllowance}
                </div>
                <span className="text-[11px] text-[#6d7a77]">guilt-free / day</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#dae2fd]/40">
              <div className="flex items-center gap-1.5 text-[#00685f] mb-1">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Emergency Buffer</span>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#00685f] flex items-center gap-1">
                  <span>Protected</span>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                </div>
                <span className="text-[11px] text-[#6d7a77]">{runwayMonths} months runway</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleLockIn}
              className="w-full h-12 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span>Lock In & Enter Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full h-11 rounded-xl bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#131b2e] font-medium text-[13px] flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">west</span>
              <span>Back to Adjust Income</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
