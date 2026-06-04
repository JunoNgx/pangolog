import {
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactions,
} from "./db/bulk";
import { useProfileSettingsStore } from "./store/useProfileSettingsStore";
import { utcNowString } from "./utils";

export async function buildDataSnapshot(shouldIncludeDeleted = false) {
    const [transactions, categories, recurringRules] = await Promise.all([
        getAllTransactions(),
        getAllCategoriesForSync(),
        getAllRecurringRulesForSync(),
    ]);

    const {
        customCurrency,
        isPrefixCurrency,
        isExpenseOnlyMode,
        isCategoryAlphabetical,
        updatedAt,
    } = useProfileSettingsStore.getState();

    return {
        exportedAt: utcNowString(),
        settings: {
            customCurrency,
            isPrefixCurrency,
            isExpenseOnlyMode,
            isCategoryAlphabetical,
            updatedAt,
        },
        transactions: transactions
            .filter((t) => shouldIncludeDeleted || t.deletedAt === null)
            .sort((a, b) => a.transactedAt.localeCompare(b.transactedAt)),
        categories: categories.filter(
            (c) => shouldIncludeDeleted || c.deletedAt === null,
        ),
        recurringRules: recurringRules.filter(
            (r) => shouldIncludeDeleted || r.deletedAt === null,
        ),
    };
}
