import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, ClassificationRule, UserBudgetConfig, ActiveTab } from '../types';
import { INITIAL_BUDGET_CONFIG, INITIAL_CLASSIFICATION_RULES, INITIAL_TRANSACTIONS } from '../data/mockData';

interface FinanceContextType {
  transactions: Transaction[];
  budgetConfig: UserBudgetConfig;
  rules: ClassificationRule[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;
  updateTransactionType: (id: string, type: 'essential' | 'luxury' | 'income') => void;
  updateBudgetConfig: (updates: Partial<UserBudgetConfig>) => void;
  addRule: (rule: Omit<ClassificationRule, 'id'>) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Computed metrics
  todaySpent: number;
  todayBudgetLeft: number;
  dailyPacePercent: number;
  weeklySpent: number;
  weeklyEssential: number;
  weeklyLuxury: number;
  weeklyNeedsPercent: number;
  weeklyWantsPercent: number;
  weeklyCapSpentPercent: number;
  monthlyTotalOutflow: number;
  monthlyTotalInflow: number;
  monthlyIncomeAvailable: number;
  monthlyUtilizationPercent: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'aura_transactions_v1',
  BUDGET: 'aura_budget_config_v1',
  RULES: 'aura_rules_v1',
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage or fall back to defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgetConfig, setBudgetConfig] = useState<UserBudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET_CONFIG;
    } catch {
      return INITIAL_BUDGET_CONFIG;
    }
  });

  const [rules, setRules] = useState<ClassificationRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RULES);
      return saved ? JSON.parse(saved) : INITIAL_CLASSIFICATION_RULES;
    } catch {
      return INITIAL_CLASSIFICATION_RULES;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budgetConfig));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [budgetConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [rules]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const addTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    // Check if auto-classification rules apply
    let finalType = newTxData.type;
    const matchedRule = rules.find(
      r => r.active && newTxData.merchant.toLowerCase().includes(r.merchant.toLowerCase())
    );
    if (matchedRule) {
      if (matchedRule.destination === 'Luxury') finalType = 'luxury';
      if (matchedRule.destination === 'Essential') finalType = 'essential';
    }

    const newTx: Transaction = {
      ...newTxData,
      type: finalType,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast(`Added ${newTx.merchant} ($${newTx.amount.toFixed(2)})`);
    return newTx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction removed');
  };

  const updateTransactionType = (id: string, type: 'essential' | 'luxury' | 'income') => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, type } : t))
    );
    showToast(`Updated to ${type === 'essential' ? 'Essential (Needs)' : type === 'luxury' ? 'Luxury (Wants)' : 'Income'}`);
  };

  const updateBudgetConfig = (updates: Partial<UserBudgetConfig>) => {
    setBudgetConfig(prev => ({ ...prev, ...updates }));
    showToast('Budget preferences updated');
  };

  const addRule = (newRuleData: Omit<ClassificationRule, 'id'>) => {
    const newRule: ClassificationRule = {
      ...newRuleData,
      id: `rule-${Date.now()}`,
    };
    setRules(prev => [...prev, newRule]);
    showToast(`Rule for "${newRule.merchant}" saved`);
  };

  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r => {
        if (r.id === id) {
          const next = !r.active;
          showToast(next ? `Rule "${r.merchant}" activated` : `Rule "${r.merchant}" paused`);
          return { ...r, active: next };
        }
        return r;
      })
    );
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    showToast('Rule removed');
  };

  // --- Computed Metrics ---
  // Today's spending (outflows only)
  const todayTransactions = transactions.filter(t => t.date.includes('Oct 24') || t.date.includes('Today'));
  const todaySpent = todayTransactions
    .filter(t => t.type !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyBudget = budgetConfig.dailyBudget || 80.0;
  const todayBudgetLeft = Math.max(0, dailyBudget - todaySpent);
  const dailyPacePercent = Math.min(100, Math.round((todayBudgetLeft / dailyBudget) * 100));

  // Weekly spending
  const weeklyOutflows = transactions.filter(t => t.type !== 'income');
  const weeklySpent = weeklyOutflows.reduce((sum, t) => sum + t.amount, 0);
  const weeklyEssential = transactions
    .filter(t => t.type === 'essential')
    .reduce((sum, t) => sum + t.amount, 0);
  const weeklyLuxury = transactions
    .filter(t => t.type === 'luxury')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalNeedsVsWants = weeklyEssential + weeklyLuxury || 1;
  const weeklyNeedsPercent = Math.round((weeklyEssential / totalNeedsVsWants) * 100);
  const weeklyWantsPercent = 100 - weeklyNeedsPercent;

  const weeklyCapSpentPercent = Math.min(
    100,
    parseFloat(((weeklySpent / (budgetConfig.weeklyCap || 670)) * 100).toFixed(1))
  );

  // Monthly inflow & outflow
  const monthlyTotalInflow = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) + budgetConfig.monthlyIncome;
  const monthlyTotalOutflow = weeklySpent; // Representing month-to-date
  const monthlyIncomeAvailable = Math.max(0, budgetConfig.monthlyIncome - monthlyTotalOutflow);
  const monthlyUtilizationPercent = Math.min(
    100,
    Math.round((monthlyTotalOutflow / (budgetConfig.monthlyIncome || 1)) * 100)
  );

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgetConfig,
        rules,
        activeTab,
        setActiveTab,
        addTransaction,
        deleteTransaction,
        updateTransactionType,
        updateBudgetConfig,
        addRule,
        toggleRule,
        deleteRule,
        toastMessage,
        showToast,
        todaySpent,
        todayBudgetLeft,
        dailyPacePercent,
        weeklySpent,
        weeklyEssential,
        weeklyLuxury,
        weeklyNeedsPercent,
        weeklyWantsPercent,
        weeklyCapSpentPercent,
        monthlyTotalOutflow,
        monthlyTotalInflow,
        monthlyIncomeAvailable,
        monthlyUtilizationPercent,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
