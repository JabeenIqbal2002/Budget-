import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ExpenseClassification } from '../types';

interface QuickExpenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassification?: ExpenseClassification;
}

export const QuickExpenseDrawer: React.FC<QuickExpenseDrawerProps> = ({
  isOpen,
  onClose,
  defaultClassification = 'Essential',
}) => {
  const { addTransaction } = useFinance();
  const [amountStr, setAmountStr] = useState('');
  const [merchant, setMerchant] = useState('');
  const [classification, setClassification] = useState<ExpenseClassification>(defaultClassification);
  const [category, setCategory] = useState('Groceries & Essentials');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || isNaN(amount) || amount <= 0) return;

    addTransaction({
      merchant: merchant.trim() || (classification === 'Essential' ? 'Daily Essential' : 'Discretionary Purchase'),
      merchantSubtitle: category,
      amount,
      type: classification === 'Essential' ? 'essential' : 'luxury',
      category,
      date: 'Oct 24, 2024',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      notes: notes.trim() || undefined,
    });

    setAmountStr('');
    setMerchant('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#283044]/40 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md bg-white rounded-t-2xl p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 rounded-full bg-[#dae2fd] mx-auto"></div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[18px] text-[#131b2e]">Log Quick Expense</h3>
            <p className="text-[12px] text-[#3d4947]">Record daily spending with mindful classification</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eaedff] flex items-center justify-center text-[#3d4947] hover:text-[#131b2e] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Amount input */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3d4947]">Amount</span>
            <div className="flex items-center px-4 h-12 rounded-xl bg-[#f2f3ff] border border-transparent focus-within:border-[#00685f]/30 focus-within:bg-white transition-all">
              <span className="font-mono-numbers text-[22px] font-semibold text-[#6d7a77] mr-1.5">$</span>
              <input
                type="number"
                step="0.01"
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                className="w-full bg-transparent font-mono-numbers text-[22px] font-semibold text-[#131b2e] focus:outline-none placeholder:text-[#bcc9c6]"
                required
              />
            </div>
          </div>

          {/* Merchant / Description */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3d4947]">Merchant or Item</span>
            <input
              type="text"
              placeholder="e.g. Trader Joe's, Blue Bottle, Metro"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              className="w-full px-3.5 h-11 rounded-xl bg-[#f2f3ff] text-[14px] text-[#131b2e] placeholder:text-[#6d7a77] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f]/30"
            />
          </div>

          {/* Classification: Needs vs Wants */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3d4947]">Spending Type</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setClassification('Essential')}
                className={`py-2.5 px-3 rounded-xl font-medium text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                  classification === 'Essential'
                    ? 'bg-[#e3dfff] text-[#4e45d5] ring-2 ring-[#4e45d5] font-semibold shadow-sm'
                    : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Essential (Needs)
              </button>
              <button
                type="button"
                onClick={() => setClassification('Luxury')}
                className={`py-2.5 px-3 rounded-xl font-medium text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                  classification === 'Luxury'
                    ? 'bg-[#ffdcc3] text-[#8d4b00] ring-2 ring-[#8d4b00] font-semibold shadow-sm'
                    : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">celebration</span>
                Luxury (Wants)
              </button>
            </div>
          </div>

          {/* Category selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3d4947]">Category</span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 h-11 rounded-xl bg-[#f2f3ff] text-[13px] text-[#131b2e] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f]/30"
            >
              <option value="Groceries & Essentials">Groceries & Essentials</option>
              <option value="Restaurants & Bars">Restaurants & Bars</option>
              <option value="Transport">Transport & Commute</option>
              <option value="Rent & Utilities">Rent & Utilities</option>
              <option value="Personal Care & Wellness">Personal Care & Wellness</option>
              <option value="Entertainment & Subscriptions">Entertainment & Subscriptions</option>
              <option value="Shopping">Shopping & Lifestyle</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-12 mt-1 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Record Expense</span>
          </button>
        </form>
      </div>
    </div>
  );
};
