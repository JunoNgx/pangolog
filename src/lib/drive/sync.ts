import { DateTime } from "luxon";
import {
    CATEGORIES_FILE,
    RECURRING_RULES_FILE,
    SETTINGS_FILE,
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
import { utcNowString } from "@/lib/utils";
import {
    backupFileName,
    createFile,
    downloadFile,
    listFiles,
    transactionFileName,
    trashFile,
    upsertFile,
} from "./client";

interface DriveSettings {
    customCurrency?: string;
    isPrefixCurrency?: boolean;
    isExpenseOnlyMode?: boolean;
    isCategoryAlphabetical?: boolean;
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

export async function runFullDriveSync(
    token: string,
    folderId: string,
): Promise<string> {
    const syncStartTime = utcNowString();

    await purgeExpiredRecords();

    const lastSyncTime = useLocalSyncDataStore.getState().lastSyncTime;

    const [localTransactions, localCategories, localRules] = await Promise.all([
        getAllTransactions(),
        getAllCategoriesForSync(),
        getAllRecurringRulesForSync(),
    ]);

    const driveFiles = await listFiles(token, folderId);

    // Deduplicate Drive files by name - keep first occurrence, trash extras
    const driveFileMap = new Map<
        string,
        { id: string; modifiedTime: string }
    >();
    const toTrashDriveFileIds: string[] = [];
    for (const f of driveFiles) {
        if (driveFileMap.has(f.name)) {
            toTrashDriveFileIds.push(f.id);
        } else {
            driveFileMap.set(f.name, {
                id: f.id,
                modifiedTime: f.modifiedTime,
            });
        }
    }
    if (toTrashDriveFileIds.length > 0) {
        await Promise.all(
            toTrashDriveFileIds.map((id) => trashFile(token, id)),
        );
    }

    // --- Download manifest ---

    const localTransactionsByYear = groupBy(localTransactions, (t) =>
        transactionFileName(t.year),
    );

    const driveYearFileNames = driveFiles
        .map((f) => f.name)
        .filter((name) => /^\d{4}\.json$/.test(name));

    const allYearFileNames = new Set([
        ...localTransactionsByYear.keys(),
        ...driveYearFileNames,
    ]);

    const relevantYearFiles = [...allYearFileNames]
        .map((yearFile) => {
            const driveEntry = driveFileMap.get(yearFile);
            if (!driveEntry) return null;
            if (lastSyncTime && driveEntry.modifiedTime <= lastSyncTime)
                return null;
            return { yearFile, driveId: driveEntry.id };
        })
        .filter(
            (entry): entry is { yearFile: string; driveId: string } =>
                entry !== null,
        );

    // --- Parallel downloads ---

    const settingsEntry = driveFileMap.get(SETTINGS_FILE);
    const categoriesEntry = driveFileMap.get(CATEGORIES_FILE);
    const rulesEntry = driveFileMap.get(RECURRING_RULES_FILE);

    const [
        remoteSettingsResult,
        remoteCategoriesResult,
        remoteRulesResult,
        remoteYearResults,
    ] = await Promise.all([
        settingsEntry
            ? downloadFile<DriveSettings>(token, settingsEntry.id)
            : Promise.resolve(null),
        categoriesEntry
            ? downloadFile<Category[]>(token, categoriesEntry.id)
            : Promise.resolve(null),
        rulesEntry
            ? downloadFile<RecurringRule[]>(token, rulesEntry.id)
            : Promise.resolve(null),
        Promise.all(
            relevantYearFiles.map(({ yearFile, driveId }) =>
                downloadFile<Transaction[]>(token, driveId).then(
                    (remoteTransactions) => ({ yearFile, remoteTransactions }),
                ),
            ),
        ),
    ]);

    // --- Settings sync ---

    const { settingsUpdatedAt, applyRemoteSettings } =
        useProfileSettingsStore.getState();

    if (
        remoteSettingsResult &&
        remoteSettingsResult.updatedAt > settingsUpdatedAt
    ) {
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
        settingsUpdatedAt: resolvedSettingsUpdatedAt,
    } = useProfileSettingsStore.getState();
    const localSettings: DriveSettings = {
        customCurrency,
        isPrefixCurrency,
        isExpenseOnlyMode,
        isCategoryAlphabetical,
        updatedAt: resolvedSettingsUpdatedAt,
    };
    await upsertFile(token, folderId, SETTINGS_FILE, localSettings);

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
        ["categories", "recurring-rules", "transactions"],
        "readwrite",
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
        upsertFile(token, folderId, CATEGORIES_FILE, uploadCategories),
    );
    uploads.push(
        upsertFile(token, folderId, RECURRING_RULES_FILE, uploadRules),
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
        uploads.push(upsertFile(token, folderId, yearFile, sortedTransactions));
    }

    await Promise.all(uploads);

    // --- Autobackup ---

    const { isAutobackupEnabled } = useLocalUserSettingsStore.getState();
    if (!isAutobackupEnabled) return syncStartTime;

    const backupTime = DateTime.fromISO(syncStartTime);
    const fileName = backupFileName(backupTime.year, backupTime.month);
    if (driveFileMap.has(fileName)) return syncStartTime;

    const backupData = await buildExportData();
    await createFile(token, folderId, fileName, backupData);

    return syncStartTime;
}
