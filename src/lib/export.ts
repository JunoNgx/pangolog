import {
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactions,
} from "./db/bulk";
import { useProfileSettingsStore } from "./store/useProfileSettingsStore";
import { todayDateString, utcNowString } from "./utils";

function triggerDownload(
    content: string,
    filename: string,
    mimeType: string,
): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export async function buildExportData() {
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
            .filter((t) => t.deletedAt === null)
            .sort((a, b) => a.transactedAt.localeCompare(b.transactedAt)),
        categories: categories.filter((c) => c.deletedAt === null),
        recurringRules: recurringRules.filter((r) => r.deletedAt === null),
    };
}

export async function exportJson(isPrettyPrint: boolean): Promise<void> {
    const data = await buildExportData();

    const content = isPrettyPrint
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

    triggerDownload(
        content,
        `pangolog-${todayDateString()}.json`,
        "application/json",
    );
}
