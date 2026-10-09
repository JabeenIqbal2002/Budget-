export type ExpenseClassification = 'Essential' | 'Luxury';
export type TransactionType = 'essential' | 'luxury' | 'income';

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ExpenseClassification;
}

export interface Transaction {
  id: string;
  merchant: string;
  merchantSubtitle?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date 'YYYY-MM-DD' or formatted 'Oct 24, 2024'
  time: string; // e.g. '11:24 AM'
  isAi?: boolean;
  confidence?: number;
  items?: LineItem[];
  notes?: string;
}

export interface ClassificationRule {
  id: string;
  merchant: string;
  destination: ExpenseClassification | 'Auto Split AI';
  subtitle: string;
  active: boolean;
}

export interface UserBudgetConfig {
  monthlyIncome: number;
  payFrequency: 'Monthly' | 'Bi-weekly' | 'Twice a Month' | 'Irregular';
  additionalIncomes: Array<{ id: string; name: string; amount: number }>;
  needsRatio: number; // e.g. 50
  luxuryRatio: number; // e.g. 30
  savingsRatio: number; // e.g. 20
  frameworkPreset: 'Balanced Aura' | 'Aggressive Saver' | 'Flex Lifestyle' | 'Custom Ratio';
  dailyBudget: number; // e.g. 80.00
  weeklyCap: number; // e.g. 670.00
  savingsGoal: {
    title: string;
    currentAmount: number;
    targetAmount: number;
  };
}

export type ActiveTab = 'today' | 'ledger' | 'scanner' | 'analytics' | 'budgets';
