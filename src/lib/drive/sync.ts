import {
    bulkPutBucks,
    bulkPutCategories,
    bulkPutDimes,
    bulkPutRecurringRules,
    getAllBucksForSync,
    getAllCategoriesForSync,
    getAllDimesForSync,
    getAllRecurringRulesForSync,
    purgeExpiredRecords,
} from "@/lib/db/sync";
import type { Buck, Category, Dime, RecurringRule } from "@/lib/db/types";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import {
    buckFileName,
    CATEGORIES_FILE,
    dimeFileName,
    downloadFile,
    listFiles,
    RECURRING_RULES_FILE,
    SETTINGS_FILE,
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

    const [localDimes, localBucks, localCategories, localRules] =
        await Promise.all([
            getAllDimesForSync(),
            getAllBucksForSync(),
            getAllCategoriesForSync(),
            getAllRecurringRulesForSync(),
        ]);

    const driveFiles = await listFiles(token, folderId);

    // Deduplicate Drive files by name - keep first occurrence, trash extras
    const driveFileMap = new Map<string, string>();
    const toTrash: string[] = [];
    for (const f of driveFiles) {
        if (driveFileMap.has(f.name)) {
            toTrash.push(f.id);
        } else {
            driveFileMap.set(f.name, f.id);
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

    const settingsFileId = driveFileMap.get(SETTINGS_FILE);
    if (settingsFileId) {
        const remote = await downloadFile<DriveSettings>(token, settingsFileId);
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

    // --- Download and merge ---

    const categoriesFileId = driveFileMap.get(CATEGORIES_FILE);
    if (categoriesFileId) {
        const remote = await downloadFile<Category[]>(token, categoriesFileId);
        await bulkPutCategories(mergeRecords(localCategories, remote));
    }

    const rulesFileId = driveFileMap.get(RECURRING_RULES_FILE);
    if (rulesFileId) {
        const remote = await downloadFile<RecurringRule[]>(token, rulesFileId);
        await bulkPutRecurringRules(mergeRecords(localRules, remote));
    }

    const localDimesByMonth = groupBy(localDimes, (d) =>
        dimeFileName(d.year, d.month),
    );
    const driveMonthFiles = driveFiles
        .map((f) => f.name)
        .filter((name) => /^\d{4}-\d{2}\.json$/.test(name));
    const allMonthFiles = new Set([
        ...localDimesByMonth.keys(),
        ...driveMonthFiles,
    ]);

    for (const monthFile of allMonthFiles) {
        const fileId = driveFileMap.get(monthFile);
        if (!fileId) continue;
        const local = localDimesByMonth.get(monthFile) ?? [];
        const remote = await downloadFile<Dime[]>(token, fileId);
        await bulkPutDimes(mergeRecords(local, remote));
    }

    const localBucksByYear = groupBy(localBucks, (b) => buckFileName(b.year));
    const driveYearFiles = driveFiles
        .map((f) => f.name)
        .filter((name) => /^\d{4}-bucks\.json$/.test(name));
    const allYearFiles = new Set([
        ...localBucksByYear.keys(),
        ...driveYearFiles,
    ]);

    for (const yearFile of allYearFiles) {
        const fileId = driveFileMap.get(yearFile);
        if (!fileId) continue;
        const local = localBucksByYear.get(yearFile) ?? [];
        const remote = await downloadFile<Buck[]>(token, fileId);
        await bulkPutBucks(mergeRecords(local, remote));
    }

    // --- Upload merged local data ---

    const [mergedDimes, mergedBucks, mergedCategories, mergedRules] =
        await Promise.all([
            getAllDimesForSync(),
            getAllBucksForSync(),
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

    const mergedDimesByMonth = groupBy(mergedDimes, (d) =>
        dimeFileName(d.year, d.month),
    );
    for (const [fileName, dimes] of mergedDimesByMonth) {
        uploads.push(upsertFile(token, folderId, fileName, dimes));
    }

    const mergedBucksByYear = groupBy(mergedBucks, (b) => buckFileName(b.year));
    for (const [fileName, bucks] of mergedBucksByYear) {
        uploads.push(upsertFile(token, folderId, fileName, bucks));
    }

    await Promise.all(uploads);
}
