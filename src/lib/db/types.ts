export interface Transaction {
    id: string;
    transactedAt: string;
    updatedAt: string;
    deletedAt: string | null;
    categoryId: string | null;
    amount: number;
    year: number;
    month: number;
    description: string;
    isIncome: boolean;
    isBigBuck: boolean;
}

export type TransactionInput = Omit<
    Transaction,
    "id" | "updatedAt" | "deletedAt" | "year" | "month"
>;

export type TransactionUpdate = Partial<
    Omit<Transaction, "id" | "updatedAt" | "deletedAt" | "year" | "month">
>;

export interface Category {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    colour: string;
    icon: string;
    priority: number;
    isBuckOnly: boolean;
    isIncomeOnly: boolean;
}

export type CategoryInput = Omit<
    Category,
    "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type CategoryUpdate = Partial<
    Omit<Category, "id" | "createdAt" | "updatedAt" | "deletedAt">
>;

export interface RecurringRule {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    categoryId: string | null;
    amount: number;
    description: string;
    isIncome: boolean;
    isBigBuck: boolean;
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    dayOfWeek: number | null;
    dayOfMonth: number | null;
    monthOfYear: number | null;
    lastGeneratedAt: string | null;
    nextGenerationAt: string;
    isActive: boolean;
}

export type RecurringRuleInput = Omit<
    RecurringRule,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "lastGeneratedAt"
>;

export type RecurringRuleUpdate = Partial<
    Omit<RecurringRule, "id" | "createdAt" | "updatedAt" | "deletedAt">
>;
