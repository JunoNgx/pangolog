export interface Dime {
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
}

export interface Buck {
    id: string;
    transactedAt: string;
    updatedAt: string;
    deletedAt: string | null;
    categoryId: string | null;
    amount: number;
    year: number;
    description: string;
    isIncome: boolean;
}

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

export type DimeInput = Omit<
    Dime,
    "id" | "updatedAt" | "deletedAt" | "year" | "month"
>;

export type DimeUpdate = Partial<
    Omit<Dime, "id" | "updatedAt" | "deletedAt" | "year" | "month">
>;

export type BuckInput = Omit<Buck, "id" | "updatedAt" | "deletedAt" | "year">;

export type BuckUpdate = Partial<
    Omit<Buck, "id" | "updatedAt" | "deletedAt" | "year">
>;

export type CategoryInput = Omit<
    Category,
    "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type CategoryUpdate = Partial<
    Omit<Category, "id" | "createdAt" | "updatedAt" | "deletedAt">
>;
