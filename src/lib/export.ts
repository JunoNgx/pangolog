import {
    getAllBucksForSync,
    getAllCategoriesForSync,
    getAllDimesForSync,
    getAllRecurringRulesForSync,
} from "./db/sync";
import { useProfileSettingsStore } from "./store/useProfileSettingsStore";

function todayString(): string {
    return new Date().toISOString().split("T")[0];
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

export async function exportJson(prettyPrint: boolean): Promise<void> {
    const [dimes, bucks, categories, recurringRules] = await Promise.all([
        getAllDimesForSync(),
        getAllBucksForSync(),
        getAllCategoriesForSync(),
        getAllRecurringRulesForSync(),
    ]);

    const { customCurrency, isPrefixCurrency, settingsUpdatedAt } =
        useProfileSettingsStore.getState();

    const data = {
        exportedAt: new Date().toISOString(),
        settings: {
            customCurrency,
            isPrefixCurrency,
            updatedAt: settingsUpdatedAt,
        },
        dimes: dimes.filter((d) => d.deletedAt === null),
        bucks: bucks.filter((b) => b.deletedAt === null),
        categories: categories.filter((c) => c.deletedAt === null),
        recurringRules: recurringRules.filter((r) => r.deletedAt === null),
    };

    const content = prettyPrint
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

    triggerDownload(
        content,
        `pangolog-${todayString()}.json`,
        "application/json",
    );
}
