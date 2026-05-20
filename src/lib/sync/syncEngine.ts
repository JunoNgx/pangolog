import { DateTime } from "luxon";
import {
    CATEGORIES_FILE,
    RECURRING_RULES_FILE,
    RW,
    SETTINGS_FILE,
    STORE_CATEGORIES,
    STORE_RECURRING_RULES,
    STORE_TRANSACTIONS,
} from "@/lib/constants";
import {
    bulkPutCategories,
    bulkPutRecurringRules,
    bulkPutTransactions,
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactions,
    purgeExpiredRecords,
} from "@/lib/db/bulk";
import { getDb } from "@/lib/db/connection";
import type { Category, RecurringRule, Transaction } from "@/lib/db/types";
import { buildExportData } from "@/lib/export";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import type { SyncProvider } from "@/lib/sync/syncProviderTypes";
import type { ProfileSettings } from "@/lib/types";
import { utcNowString } from "@/lib/utils";

// --- File name helpers (provider-agnostic) ---

export function transactionFileName(year: number): string {
    return `${year}.json`;
}

export function backupFileName(year: number, month: number): string {
    const mm = String(month).padStart(2, "0");
    return `backup-${year}-${mm}.json`;
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

function deduplicateRecurringTransactions(
    transactions: Transaction[],
): Transaction[] {
    const now = utcNowString();
    const groups = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
        if (transaction.deletedAt !== null) continue;
        if (!transaction.ruleId || !transaction.rulePeriod) continue;
        const key = `${transaction.ruleId}:${transaction.rulePeriod}`;
        const group = groups.get(key) ?? [];
        group.push(transaction);
        groups.set(key, group);
    }

    const softDeletedDuplicates: Transaction[] = [];
    for (const group of groups.values()) {
        if (group.length <= 1) continue;
        const keeper = group.reduce((a, b) =>
            a.updatedAt < b.updatedAt ? a : b,
        );
        for (const transaction of group) {
            if (transaction.id === keeper.id) continue;
            softDeletedDuplicates.push({
                ...transaction,
                deletedAt: now,
                updatedAt: now,
            });
        }
    }

    return softDeletedDuplicates;
}

function mergeRecords<T extends { id: string; updatedAt: string }>(
    local: T[],
    remote: T[],
): T[] {
    const map = new Map<string, T>();
    for (const r of local) map.set(r.id, r);
    for (const r of remote) {
        const localRecord = map.get(r.id);
        if (!localRecord) {
            map.set(r.id, r);
            continue;
        }
        if (r.updatedAt > localRecord.updatedAt) {
            console.debug(
                `[sync] conflict on ${r.id}: remote (${r.updatedAt}) > local (${localRecord.updatedAt}), remote wins`,
            );
            map.set(r.id, r);
        }
    }
    return Array.from(map.values());
}

export async function runFullSync(
    token: string,
    rootId: string,
    provider: SyncProvider,
): Promise<string> {
    const syncStartTime = utcNowString();

    await purgeExpiredRecords();

    const lastSyncTime = useLocalSyncDataStore.getState().lastSyncTime;

    const [localTransactions, localCategories, localRules] = await Promise.all([
        getAllTransactions(),
        getAllCategoriesForSync(),
        getAllRecurringRulesForSync(),
    ]);

    const remoteFiles = await provider.listFiles(token, rootId);

    // Deduplicate remote files by name - keep first occurrence, trash extras
    const remoteFileMap = new Map<
        string,
        { id: string; modifiedTime: string }
    >();
    const toTrashFileIds: string[] = [];
    for (const f of remoteFiles) {
        if (remoteFileMap.has(f.name)) {
            toTrashFileIds.push(f.id);
        } else {
            remoteFileMap.set(f.name, {
                id: f.id,
                modifiedTime: f.modifiedTime,
            });
        }
    }
    if (toTrashFileIds.length > 0) {
        await Promise.all(
            toTrashFileIds.map((id) => provider.trashFile(token, id)),
        );
    }

    // --- Download manifest ---

    const localTransactionsByYear = groupBy(localTransactions, (t) =>
        transactionFileName(t.year),
    );

    const remoteYearFileNames = remoteFiles
        .map((f) => f.name)
        .filter((name) => /^\d{4}\.json$/.test(name));

    const allYearFileNames = new Set([
        ...localTransactionsByYear.keys(),
        ...remoteYearFileNames,
    ]);

    const relevantYearFiles = [...allYearFileNames]
        .map((yearFile) => {
            const remoteEntry = remoteFileMap.get(yearFile);
            if (!remoteEntry) return null;
            if (lastSyncTime && remoteEntry.modifiedTime <= lastSyncTime)
                return null;
            return { yearFile, remoteId: remoteEntry.id };
        })
        .filter(
            (entry): entry is { yearFile: string; remoteId: string } =>
                entry !== null,
        );

    // --- Parallel downloads ---

    const settingsEntry = remoteFileMap.get(SETTINGS_FILE);
    const categoriesEntry = remoteFileMap.get(CATEGORIES_FILE);
    const rulesEntry = remoteFileMap.get(RECURRING_RULES_FILE);

    const [
        remoteSettingsResult,
        remoteCategoriesResult,
        remoteRulesResult,
        remoteYearResults,
    ] = await Promise.all([
        settingsEntry
            ? provider.downloadFile<ProfileSettings>(token, settingsEntry.id)
            : Promise.resolve(null),
        categoriesEntry
            ? provider.downloadFile<Category[]>(token, categoriesEntry.id)
            : Promise.resolve(null),
        rulesEntry
            ? provider.downloadFile<RecurringRule[]>(token, rulesEntry.id)
            : Promise.resolve(null),
        Promise.all(
            relevantYearFiles.map(({ yearFile, remoteId }) =>
                provider
                    .downloadFile<Transaction[]>(token, remoteId)
                    .then((remoteTransactions) => ({
                        yearFile,
                        remoteTransactions,
                    })),
            ),
        ),
    ]);

    // --- Settings sync ---

    const { updatedAt, applyRemoteSettings } =
        useProfileSettingsStore.getState();

    if (remoteSettingsResult && remoteSettingsResult.updatedAt > updatedAt) {
        applyRemoteSettings(
            remoteSettingsResult.customCurrency ?? "",
            remoteSettingsResult.isPrefixCurrency ?? true,
            remoteSettingsResult.isExpenseOnlyMode ?? false,
            remoteSettingsResult.isCategoryAlphabetical ?? false,
            remoteSettingsResult.updatedAt,
        );
    }

    const {
        customCurrency,
        isPrefixCurrency,
        isExpenseOnlyMode,
        isCategoryAlphabetical,
        updatedAt: storedUpdatedAt,
    } = useProfileSettingsStore.getState();
    const localSettings: ProfileSettings = {
        customCurrency,
        isPrefixCurrency,
        isExpenseOnlyMode,
        isCategoryAlphabetical,
        updatedAt: storedUpdatedAt,
    };
    await provider.upsertFile(token, rootId, SETTINGS_FILE, localSettings);

    // --- In-memory merges ---

    const mergedCategories = remoteCategoriesResult
        ? mergeRecords(localCategories, remoteCategoriesResult)
        : localCategories;

    const mergedRules = remoteRulesResult
        ? mergeRecords(localRules, remoteRulesResult)
        : localRules;

    const mergedTransactionsByYear = new Map(localTransactionsByYear);
    for (const { yearFile, remoteTransactions } of remoteYearResults) {
        const localYearTransactions =
            localTransactionsByYear.get(yearFile) ?? [];
        mergedTransactionsByYear.set(
            yearFile,
            mergeRecords(localYearTransactions, remoteTransactions),
        );
    }
    const allMergedTransactions = [...mergedTransactionsByYear.values()].flat();

    // --- Parallel DB writes ---
    // All three stores are written inside a single IndexedDB transaction so
    // that failure in any one store rolls back the entire batch.

    const db = await getDb();
    const tx = db.transaction(
        [STORE_CATEGORIES, STORE_RECURRING_RULES, STORE_TRANSACTIONS],
        RW,
    );

    await Promise.all([
        bulkPutCategories(mergedCategories, tx),
        bulkPutRecurringRules(mergedRules, tx),
        bulkPutTransactions(allMergedTransactions, tx),
    ]);

    // --- Deduplicate runner-generated transactions ---

    const softDeletedDuplicates = deduplicateRecurringTransactions(
        await getAllTransactions(),
    );
    if (softDeletedDuplicates.length > 0) {
        await bulkPutTransactions(softDeletedDuplicates);
    }

    // --- Upload merged local data ---

    // Re-read from DB rather than reusing in-memory merged data: dedup may have
    // written additional soft-deletes, and the parallel bulkPut above merges
    // records by last-write-wins -- the DB is the authoritative final state.
    const [uploadTransactions, uploadCategories, uploadRules] =
        await Promise.all([
            getAllTransactions(),
            getAllCategoriesForSync(),
            getAllRecurringRulesForSync(),
        ]);

    const uploads: Promise<void>[] = [];

    uploads.push(
        provider.upsertFile(token, rootId, CATEGORIES_FILE, uploadCategories),
    );
    uploads.push(
        provider.upsertFile(token, rootId, RECURRING_RULES_FILE, uploadRules),
    );

    const uploadTransactionsByYear = groupBy(uploadTransactions, (t) =>
        transactionFileName(t.year),
    );

    for (const [yearFile, transactions] of uploadTransactionsByYear) {
        // Smart sync: skip upload if no mutations since last sync
        if (
            lastSyncTime &&
            !transactions.some((t) => t.updatedAt > lastSyncTime)
        ) {
            continue;
        }
        const sortedTransactions = [...transactions].sort((a, b) =>
            a.transactedAt.localeCompare(b.transactedAt),
        );
        uploads.push(
            provider.upsertFile(token, rootId, yearFile, sortedTransactions),
        );
    }

    await Promise.all(uploads);

    // --- Autobackup ---

    const { isAutobackupEnabled } = useLocalUserSettingsStore.getState();
    if (!isAutobackupEnabled) return syncStartTime;

    const backupTime = DateTime.fromISO(syncStartTime);
    const fileName = backupFileName(backupTime.year, backupTime.month);
    if (remoteFileMap.has(fileName)) return syncStartTime;

    const backupData = await buildExportData();
    await provider.createFile(token, rootId, fileName, backupData);

    return syncStartTime;
}
