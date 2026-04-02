import {
    bulkPutCategories,
    bulkPutRecurringRules,
    bulkPutTransactions,
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactions,
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

const VALID_FREQUENCIES = new Set(["daily", "weekly", "monthly", "yearly"]);

function isValidTransaction(item: unknown): item is Transaction {
    if (!isRecord(item)) return false;
    return (
        typeof item.amount === "number" &&
        typeof item.transactedAt === "string" &&
        typeof item.isBigBuck === "boolean"
    );
}

function isValidCategory(item: unknown): item is Category {
    if (!isRecord(item)) return false;
    return typeof item.name === "string";
}

function isValidRecurringRule(item: unknown): item is RecurringRule {
    if (!isRecord(item)) return false;
    return (
        typeof item.amount === "number" &&
        VALID_FREQUENCIES.has(item.frequency as string)
    );
}

/** Returns null if valid, or a descriptive error string if not. */
export function validateImportData(data: unknown): string | null {
    if (!isRecord(data)) return "File content is not a valid JSON object.";
    if (!Array.isArray(data.categories))
        return "Missing or invalid categories array.";
    if (!data.categories.every(hasRequiredFields))
        return "One or more categories are missing required fields (id, updatedAt).";
    if (data.transactions !== undefined) {
        if (!Array.isArray(data.transactions))
            return "transactions field must be an array.";
        if (!data.transactions.every(hasRequiredFields))
            return "One or more transactions are missing required fields (id, updatedAt).";
    }
    if (data.recurringRules !== undefined) {
        if (!Array.isArray(data.recurringRules))
            return "recurringRules field must be an array.";
        if (!data.recurringRules.every(hasRequiredFields))
            return "One or more recurring rules are missing required fields (id, updatedAt).";
    }
    return null;
}

export async function previewImport(data: ImportData): Promise<ImportPreview> {
    const [existingTransactions, existingCategories, existingRules] =
        await Promise.all([
            getAllTransactions(),
            getAllCategoriesForSync(),
            getAllRecurringRulesForSync(),
        ]);

    const transactionMap = new Map(existingTransactions.map((t) => [t.id, t]));
    const categoryMap = new Map(existingCategories.map((c) => [c.id, c]));
    const ruleMap = new Map(existingRules.map((r) => [r.id, r]));

    const errors: string[] = [];

    let transactionsAdded = 0;
    let transactionsUpdated = 0;
    for (const [txIndex, tx] of (data.transactions ?? []).entries()) {
        const { id: txId } = tx;
        if (!isValidTransaction(tx)) {
            errors.push(
                `Transaction #${txIndex + 1} (${txId}) skipped: missing required fields (amount, transactedAt, isBigBuck).`,
            );
            continue;
        }
        const storedTx = transactionMap.get(tx.id);
        if (!storedTx) {
            transactionsAdded++;
        } else if (tx.updatedAt > storedTx.updatedAt) {
            transactionsUpdated++;
        }
    }

    let categoriesAdded = 0;
    let categoriesUpdated = 0;
    for (const [catIndex, cat] of data.categories.entries()) {
        const { id: catId } = cat;
        if (!isValidCategory(cat)) {
            errors.push(
                `Category #${catIndex + 1} (${catId}) skipped: missing required field (name).`,
            );
            continue;
        }
        const storedCat = categoryMap.get(cat.id);
        if (!storedCat) {
            categoriesAdded++;
        } else if (cat.updatedAt > storedCat.updatedAt) {
            categoriesUpdated++;
        }
    }

    let rulesAdded = 0;
    let rulesUpdated = 0;
    for (const [ruleIndex, rule] of (data.recurringRules ?? []).entries()) {
        const { id: ruleId } = rule;
        if (!isValidRecurringRule(rule)) {
            errors.push(
                `Recurring rule #${ruleIndex + 1} (${ruleId}) skipped: missing required fields (amount, frequency).`,
            );
            continue;
        }
        const storedRule = ruleMap.get(rule.id);
        if (!storedRule) {
            rulesAdded++;
        } else if (rule.updatedAt > storedRule.updatedAt) {
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
        errors,
    };
}

export async function executeImport(data: ImportData): Promise<ImportPreview> {
    const preview = await previewImport(data);

    const [existingTransactions, existingCategories, existingRules] =
        await Promise.all([
            getAllTransactions(),
            getAllCategoriesForSync(),
            getAllRecurringRulesForSync(),
        ]);

    const transactionMap = new Map(existingTransactions.map((t) => [t.id, t]));
    const categoryMap = new Map(existingCategories.map((c) => [c.id, c]));
    const ruleMap = new Map(existingRules.map((r) => [r.id, r]));

    const transactionsToPut = (data.transactions ?? []).filter((t) => {
        if (!isValidTransaction(t)) return false;
        const storedTx = transactionMap.get(t.id);
        return !storedTx || t.updatedAt > storedTx.updatedAt;
    });

    const categoriesToPut = data.categories.filter((c) => {
        if (!isValidCategory(c)) return false;
        const storedCat = categoryMap.get(c.id);
        return !storedCat || c.updatedAt > storedCat.updatedAt;
    });

    const rulesToPut = (data.recurringRules ?? []).filter((r) => {
        if (!isValidRecurringRule(r)) return false;
        const storedRule = ruleMap.get(r.id);
        return !storedRule || r.updatedAt > storedRule.updatedAt;
    });

    try {
        await Promise.all([
            bulkPutTransactions(transactionsToPut),
            bulkPutCategories(categoriesToPut),
            bulkPutRecurringRules(rulesToPut),
        ]);
    } catch (err) {
        throw new Error(`Failed to write records to database: ${err}`);
    }

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
