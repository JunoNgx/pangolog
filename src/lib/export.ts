import { DateTime } from "luxon";
import {
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactionsForSync,
} from "./db/bulk";
import { useProfileSettingsStore } from "./store/useProfileSettingsStore";

function todayString(): string {
    return DateTime.now().toISODate()!;
}

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
        getAllTransactionsForSync(),
        getAllCategoriesForSync(),
        getAllRecurringRulesForSync(),
    ]);

    const { customCurrency, isPrefixCurrency, settingsUpdatedAt } =
        useProfileSettingsStore.getState();

    return {
        exportedAt: DateTime.now().toUTC().toISO()!,
        settings: {
            customCurrency,
            isPrefixCurrency,
            updatedAt: settingsUpdatedAt,
        },
        transactions: transactions.filter((t) => t.deletedAt === null),
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
        `pangolog-${todayString()}.json`,
        "application/json",
    );
}
