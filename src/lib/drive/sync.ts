import { DateTime } from "luxon";
import {
    bulkPutCategories,
    bulkPutRecurringRules,
    bulkPutTransactions,
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactionsForSync,
    purgeExpiredRecords,
} from "@/lib/db/bulk";
import type { Category, RecurringRule, Transaction } from "@/lib/db/types";
import { buildExportData } from "@/lib/export";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import {
    backupFileName,
    CATEGORIES_FILE,
    createFile,
    downloadFile,
    listFiles,
    RECURRING_RULES_FILE,
    SETTINGS_FILE,
    transactionFileName,
    trashFile,
    upsertFile,
} from "./client";

interface DriveSettings {
    customCurrency: string;
    isPrefixCurrency: boolean;
    updatedAt: string;
}

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of arr) {
        const k = key(item);
        const group = map.get(k) ?? [];
        group.push(item);
        map.set(k, group);
    }
    return map;
}

function mergeRecords<T extends { id: string; updatedAt: string }>(
    local: T[],
    remote: T[],
): T[] {
    const map = new Map<string, T>();
    for (const r of local) map.set(r.id, r);
    for (const r of remote) {
        const existing = map.get(r.id);
        if (!existing) {
            map.set(r.id, r);
            continue;
        }
        if (r.updatedAt > existing.updatedAt) {
            console.debug(
                `[sync] conflict on ${r.id}: remote (${r.updatedAt}) > local (${existing.updatedAt}), remote wins`,
            );
            map.set(r.id, r);
        }
    }
    return Array.from(map.values());
}

export async function syncAll(token: string, folderId: string): Promise<void> {
    await purgeExpiredRecords();

    const lastSyncTime = useLocalSettingsStore.getState().lastSyncTime;

    const [localTransactions, localCategories, localRules] = await Promise.all([
        getAllTransactionsForSync(),
        getAllCategoriesForSync(),
        getAllRecurringRulesForSync(),
    ]);

    const driveFiles = await listFiles(token, folderId);

    // Deduplicate Drive files by name - keep first occurrence, trash extras
    const driveFileMap = new Map<
        string,
        { id: string; modifiedTime: string }
    >();
    const toTrash: string[] = [];
    for (const f of driveFiles) {
        if (driveFileMap.has(f.name)) {
            toTrash.push(f.id);
        } else {
            driveFileMap.set(f.name, {
                id: f.id,
                modifiedTime: f.modifiedTime,
            });
        }
    }
    if (toTrash.length > 0) {
        await Promise.all(toTrash.map((id) => trashFile(token, id)));
    }

    // --- Settings sync ---

    const {
        customCurrency,
        isPrefixCurrency,
        settingsUpdatedAt,
        applyRemoteSettings,
    } = useProfileSettingsStore.getState();

    const settingsEntry = driveFileMap.get(SETTINGS_FILE);
    if (settingsEntry) {
        const remote = await downloadFile<DriveSettings>(
            token,
            settingsEntry.id,
        );
        if (remote.updatedAt > settingsUpdatedAt) {
            applyRemoteSettings(
                remote.customCurrency,
                remote.isPrefixCurrency,
                remote.updatedAt,
            );
        }
    }

    const localSettings: DriveSettings = {
        customCurrency,
        isPrefixCurrency,
        updatedAt: settingsUpdatedAt,
    };
    await upsertFile(token, folderId, SETTINGS_FILE, localSettings);

    // --- Download and merge categories + rules ---

    const categoriesEntry = driveFileMap.get(CATEGORIES_FILE);
    if (categoriesEntry) {
        const remote = await downloadFile<Category[]>(
            token,
            categoriesEntry.id,
        );
        await bulkPutCategories(mergeRecords(localCategories, remote));
    }

    const rulesEntry = driveFileMap.get(RECURRING_RULES_FILE);
    if (rulesEntry) {
        const remote = await downloadFile<RecurringRule[]>(
            token,
            rulesEntry.id,
        );
        await bulkPutRecurringRules(mergeRecords(localRules, remote));
    }

    // --- Download and merge transactions (YYYY.json, smart sync) ---

    const localTransactionsByYear = groupBy(localTransactions, (t) =>
        transactionFileName(t.year),
    );

    const driveYearFiles = driveFiles
        .map((f) => f.name)
        .filter((name) => /^\d{4}\.json$/.test(name));

    const allYearFiles = new Set([
        ...localTransactionsByYear.keys(),
        ...driveYearFiles,
    ]);

    for (const yearFile of allYearFiles) {
        const driveEntry = driveFileMap.get(yearFile);
        if (!driveEntry) continue;

        // Smart sync: skip download if file not modified since last sync
        if (lastSyncTime && driveEntry.modifiedTime <= lastSyncTime) continue;

        const local = localTransactionsByYear.get(yearFile) ?? [];
        const remote = await downloadFile<Transaction[]>(token, driveEntry.id);
        await bulkPutTransactions(mergeRecords(local, remote));
    }

    // --- Upload merged local data ---

    const [mergedTransactions, mergedCategories, mergedRules] =
        await Promise.all([
            getAllTransactionsForSync(),
            getAllCategoriesForSync(),
            getAllRecurringRulesForSync(),
        ]);

    const uploads: Promise<void>[] = [];

    uploads.push(
        upsertFile(token, folderId, CATEGORIES_FILE, mergedCategories),
    );
    uploads.push(
        upsertFile(token, folderId, RECURRING_RULES_FILE, mergedRules),
    );

    const mergedTransactionsByYear = groupBy(mergedTransactions, (t) =>
        transactionFileName(t.year),
    );

    for (const [yearFile, transactions] of mergedTransactionsByYear) {
        // Smart sync: skip upload if no mutations since last sync
        if (
            lastSyncTime &&
            !transactions.some((t) => t.updatedAt > lastSyncTime)
        ) {
            continue;
        }
        uploads.push(upsertFile(token, folderId, yearFile, transactions));
    }

    await Promise.all(uploads);

    // --- Autobackup ---

    const { isAutobackupEnabled } = useLocalSettingsStore.getState();
    if (!isAutobackupEnabled) return;

    const now = DateTime.now();
    const fileName = backupFileName(now.year, now.month);
    if (driveFileMap.has(fileName)) return;

    const backupData = await buildExportData();
    await createFile(token, folderId, fileName, backupData);
}
