import {
    bulkPutCategories,
    bulkPutRecurringRules,
    bulkPutTransactions,
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactionsForSync,
} from "./db/bulk";
import type { Category, RecurringRule, Transaction } from "./db/types";
import { useProfileSettingsStore } from "./store/useProfileSettingsStore";

interface ImportSettings {
    customCurrency: string;
    isPrefixCurrency: boolean;
    updatedAt: string;
}

export interface ImportData {
    exportedAt: string;
    settings?: ImportSettings;
    transactions?: Transaction[];
    categories: Category[];
    recurringRules?: RecurringRule[];
}

export interface ImportPreview {
    transactionsAdded: number;
    transactionsUpdated: number;
    categoriesAdded: number;
    categoriesUpdated: number;
    rulesAdded: number;
    rulesUpdated: number;
    errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasRequiredFields(
    item: unknown,
): item is { id: string; updatedAt: string } {
    if (!isRecord(item)) return false;
    return typeof item.id === "string" && typeof item.updatedAt === "string";
}

export function validateImportData(data: unknown): data is ImportData {
    if (!isRecord(data)) return false;
    if (!Array.isArray(data.categories)) return false;
    if (!data.categories.every(hasRequiredFields)) return false;
    if (data.transactions !== undefined) {
        if (!Array.isArray(data.transactions)) return false;
        if (!data.transactions.every(hasRequiredFields)) return false;
    }
    if (data.recurringRules !== undefined) {
        if (!Array.isArray(data.recurringRules)) return false;
        if (!data.recurringRules.every(hasRequiredFields)) return false;
    }
    return true;
}

export async function previewImport(data: ImportData): Promise<ImportPreview> {
    const [existingTransactions, existingCategories, existingRules] =
        await Promise.all([
            getAllTransactionsForSync(),
            getAllCategoriesForSync(),
            getAllRecurringRulesForSync(),
        ]);

    const transactionMap = new Map(existingTransactions.map((t) => [t.id, t]));
    const categoryMap = new Map(existingCategories.map((c) => [c.id, c]));
    const ruleMap = new Map(existingRules.map((r) => [r.id, r]));

    let transactionsAdded = 0;
    let transactionsUpdated = 0;
    for (const tx of data.transactions ?? []) {
        const existing = transactionMap.get(tx.id);
        if (!existing) {
            transactionsAdded++;
        } else if (tx.updatedAt > existing.updatedAt) {
            transactionsUpdated++;
        }
    }

    let categoriesAdded = 0;
    let categoriesUpdated = 0;
    for (const cat of data.categories) {
        const existing = categoryMap.get(cat.id);
        if (!existing) {
            categoriesAdded++;
        } else if (cat.updatedAt > existing.updatedAt) {
            categoriesUpdated++;
        }
    }

    let rulesAdded = 0;
    let rulesUpdated = 0;
    for (const rule of data.recurringRules ?? []) {
        const existing = ruleMap.get(rule.id);
        if (!existing) {
            rulesAdded++;
        } else if (rule.updatedAt > existing.updatedAt) {
            rulesUpdated++;
        }
    }

    return {
        transactionsAdded,
        transactionsUpdated,
        categoriesAdded,
        categoriesUpdated,
        rulesAdded,
        rulesUpdated,
        errors: [],
    };
}

export async function executeImport(data: ImportData): Promise<ImportPreview> {
    const preview = await previewImport(data);

    const [existingTransactions, existingCategories, existingRules] =
        await Promise.all([
            getAllTransactionsForSync(),
            getAllCategoriesForSync(),
            getAllRecurringRulesForSync(),
        ]);

    const transactionMap = new Map(existingTransactions.map((t) => [t.id, t]));
    const categoryMap = new Map(existingCategories.map((c) => [c.id, c]));
    const ruleMap = new Map(existingRules.map((r) => [r.id, r]));

    const transactionsToPut = (data.transactions ?? []).filter((t) => {
        const existing = transactionMap.get(t.id);
        return !existing || t.updatedAt > existing.updatedAt;
    });

    const categoriesToPut = data.categories.filter((c) => {
        const existing = categoryMap.get(c.id);
        return !existing || c.updatedAt > existing.updatedAt;
    });

    const rulesToPut = (data.recurringRules ?? []).filter((r) => {
        const existing = ruleMap.get(r.id);
        return !existing || r.updatedAt > existing.updatedAt;
    });

    await Promise.all([
        bulkPutTransactions(transactionsToPut),
        bulkPutCategories(categoriesToPut),
        bulkPutRecurringRules(rulesToPut),
    ]);

    if (data.settings) {
        const { settingsUpdatedAt, applyRemoteSettings } =
            useProfileSettingsStore.getState();
        if (data.settings.updatedAt > settingsUpdatedAt) {
            applyRemoteSettings(
                data.settings.customCurrency,
                data.settings.isPrefixCurrency,
                data.settings.updatedAt,
            );
        }
    }

    return preview;
}
