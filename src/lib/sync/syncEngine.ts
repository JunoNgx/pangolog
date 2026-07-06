import { DateTime } from "luxon";
import {
    DATA_FILE,
    RW,
    STORE_CATEGORIES,
    STORE_RECURRING_RULES,
    STORE_TRANSACTIONS,
} from "@/lib/constants";
import { buildDataSnapshot } from "@/lib/dataProcess";
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
import type { Transaction } from "@/lib/db/types";
import type { ImportData } from "@/lib/import";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import type { SyncProvider } from "@/lib/sync/syncProviderTypes";
import { utcNowString } from "@/lib/utils";

// --- File name helpers (provider-agnostic) ---

export function backupFileName(year: number, month: number): string {
    const mm = String(month).padStart(2, "0");
    return `backup-${year}-${mm}.json`;
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

export function mergeRecords<T extends { id: string; updatedAt: string }>(
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

    // --- Download remote data ---

    const dataEntry = remoteFileMap.get(DATA_FILE);
    const remoteData: ImportData | null = dataEntry
        ? await provider.downloadFile<ImportData>(token, dataEntry.id)
        : null;

    // --- Settings sync ---

    const { updatedAt, applyRemoteSettings } =
        useProfileSettingsStore.getState();

    const remoteSettings = remoteData?.settings;
    if (remoteSettings && remoteSettings.updatedAt > updatedAt) {
        applyRemoteSettings(
            remoteSettings.customCurrency ?? "",
            remoteSettings.isPrefixCurrency ?? true,
            remoteSettings.isExpenseOnlyMode ?? false,
            remoteSettings.isCategoryAlphabetical ?? false,
            remoteSettings.shouldAutoSelectFirstCategory ?? false,
            remoteSettings.updatedAt,
        );
    }

    // --- In-memory merges ---

    const remoteCategories = remoteData?.categories ?? [];
    const remoteRules = remoteData?.recurringRules ?? [];
    const remoteTransactions = remoteData?.transactions ?? [];

    const mergedCategories =
        remoteCategories.length > 0
            ? mergeRecords(localCategories, remoteCategories)
            : localCategories;

    const mergedRules =
        remoteRules.length > 0
            ? mergeRecords(localRules, remoteRules)
            : localRules;

    const mergedTransactions =
        remoteTransactions.length > 0
            ? mergeRecords(localTransactions, remoteTransactions)
            : localTransactions;

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
        bulkPutTransactions(mergedTransactions, tx),
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
    const uploadData = await buildDataSnapshot(true);
    await provider.upsertFile(token, rootId, DATA_FILE, uploadData);

    // --- Autobackup ---

    const { isAutobackupEnabled } = useLocalUserSettingsStore.getState();
    if (!isAutobackupEnabled) return syncStartTime;

    const backupTime = DateTime.fromISO(syncStartTime);
    const fileName = backupFileName(backupTime.year, backupTime.month);
    if (remoteFileMap.has(fileName)) return syncStartTime;

    const backupData = await buildDataSnapshot();
    await provider.createFile(token, rootId, fileName, backupData);

    return syncStartTime;
}
