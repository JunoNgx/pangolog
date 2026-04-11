import { DateTime } from "luxon";
import {
    bulkPutCategories,
    bulkPutRecurringRules,
    bulkPutTransactions,
    getAllCategoriesForSync,
    getAllRecurringRulesForSync,
    getAllTransactions,
    purgeExpiredRecords,
} from "@/lib/db/bulk";
import type { Category, RecurringRule, Transaction } from "@/lib/db/types";
import { buildExportData } from "@/lib/export";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
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
    const now = DateTime.now().toUTC().toISO()!;
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
    const syncStartTime = DateTime.now().toUTC().toISO()!;

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
        await Promise.all(toTrashDriveFileIds.map((id) => trashFile(token, id)));
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

    // --- Merge categories + rules ---

    if (remoteCategoriesResult) {
        await bulkPutCategories(
            mergeRecords(localCategories, remoteCategoriesResult),
        );
    }

    if (remoteRulesResult) {
        await bulkPutRecurringRules(
            mergeRecords(localRules, remoteRulesResult),
        );
    }

    // --- Merge transactions (YYYY.json) ---

    for (const { yearFile, remoteTransactions } of remoteYearResults) {
        const localYearTransactions =
            localTransactionsByYear.get(yearFile) ?? [];
        await bulkPutTransactions(
            mergeRecords(localYearTransactions, remoteTransactions),
        );
    }

    // --- Deduplicate runner-generated transactions ---

    const softDeletedDuplicates = deduplicateRecurringTransactions(
        await getAllTransactions(),
    );
    if (softDeletedDuplicates.length > 0) {
        await bulkPutTransactions(softDeletedDuplicates);
    }

    // --- Upload merged local data ---

    const [mergedTransactions, mergedCategories, mergedRules] =
        await Promise.all([
            getAllTransactions(),
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
        const sortedTransactions = [...transactions].sort((a, b) =>
            a.transactedAt.localeCompare(b.transactedAt),
        );
        uploads.push(upsertFile(token, folderId, yearFile, sortedTransactions));
    }

    await Promise.all(uploads);

    // --- Autobackup ---

    const { isAutobackupEnabled } = useLocalUserSettingsStore.getState();
    if (!isAutobackupEnabled) return syncStartTime;

    const now = DateTime.now();
    const fileName = backupFileName(now.year, now.month);
    if (driveFileMap.has(fileName)) return syncStartTime;

    const backupData = await buildExportData();
    await createFile(token, folderId, fileName, backupData);

    return syncStartTime;
}
