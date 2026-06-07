import { DateTime } from "luxon";
import {
    PURGE_DAYS,
    RW,
    STORE_CATEGORIES,
    STORE_RECURRING_RULES,
    STORE_TRANSACTIONS,
    type StoreName,
} from "@/lib/constants";
import { toIsoString } from "@/lib/utils";
import { forceDeleteDb, getDb } from "./connection";
import { openStore, performIdbRequest, performTransaction } from "./idbHelpers";
import type { Category, RecurringRule, Transaction } from "./types";

async function purgeStore(
    storeName: StoreName,
    cutoffIso: string,
): Promise<void> {
    const db = await getDb();
    const tx = db.transaction(storeName, RW);
    const store = tx.objectStore(storeName);
    const request = store.openCursor();

    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        const record = cursor.value as { deletedAt: string | null };
        if (record.deletedAt && record.deletedAt < cutoffIso) {
            cursor.delete();
        }
        cursor.continue();
    };

    await performTransaction(tx);
}

export async function purgeExpiredRecords(): Promise<void> {
    const cutoffIso = toIsoString(
        DateTime.now().minus({ days: PURGE_DAYS }).toUTC(),
    );

    await Promise.all([
        purgeStore(STORE_CATEGORIES, cutoffIso),
        purgeStore(STORE_RECURRING_RULES, cutoffIso),
        purgeStore(STORE_TRANSACTIONS, cutoffIso),
    ]);
}

export async function getAllCategoriesForSync(): Promise<Category[]> {
    const db = await getDb();
    return performIdbRequest(
        openStore({
            db,
            storeName: STORE_CATEGORIES,
            mode: "readonly",
        }).getAll(),
    );
}

export async function getAllRecurringRulesForSync(): Promise<RecurringRule[]> {
    const db = await getDb();
    return performIdbRequest(
        openStore({
            db,
            storeName: STORE_RECURRING_RULES,
            mode: "readonly",
        }).getAll(),
    );
}

export async function getAllTransactions(): Promise<Transaction[]> {
    const db = await getDb();
    return performIdbRequest(
        openStore({
            db,
            storeName: STORE_TRANSACTIONS,
            mode: "readonly",
        }).getAll(),
    );
}

export async function bulkPutTransactions(
    transactions: Transaction[],
    existingTx?: IDBTransaction,
): Promise<void> {
    if (existingTx) {
        const store = existingTx.objectStore(STORE_TRANSACTIONS);
        for (const transaction of transactions) store.put(transaction);
        return;
    }

    const db = await getDb();
    const tx = db.transaction(STORE_TRANSACTIONS, RW);
    const store = tx.objectStore(STORE_TRANSACTIONS);
    for (const transaction of transactions) store.put(transaction);
    await performTransaction(tx);
}

export async function bulkPutCategories(
    categories: Category[],
    existingTx?: IDBTransaction,
): Promise<void> {
    if (existingTx) {
        const store = existingTx.objectStore(STORE_CATEGORIES);
        for (const category of categories) store.put(category);
        return;
    }

    const db = await getDb();
    const tx = db.transaction(STORE_CATEGORIES, RW);
    const store = tx.objectStore(STORE_CATEGORIES);
    for (const category of categories) store.put(category);
    await performTransaction(tx);
}

export async function bulkPutRecurringRules(
    rules: RecurringRule[],
    existingTx?: IDBTransaction,
): Promise<void> {
    if (existingTx) {
        const store = existingTx.objectStore(STORE_RECURRING_RULES);
        for (const rule of rules) store.put(rule);
        return;
    }

    const db = await getDb();
    const tx = db.transaction(STORE_RECURRING_RULES, RW);
    const store = tx.objectStore(STORE_RECURRING_RULES);
    for (const rule of rules) store.put(rule);
    await performTransaction(tx);
}

export async function clearAllData(): Promise<void> {
    try {
        const db = await getDb();
        const tx = db.transaction(
            [STORE_CATEGORIES, STORE_RECURRING_RULES, STORE_TRANSACTIONS],
            RW,
        );
        tx.objectStore(STORE_CATEGORIES).clear();
        tx.objectStore(STORE_RECURRING_RULES).clear();
        tx.objectStore(STORE_TRANSACTIONS).clear();
        await performTransaction(tx);
    } catch {
        await forceDeleteDb();
    }
}
