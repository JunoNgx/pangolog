import { DateTime } from "luxon";
import {
    PURGE_DAYS,
    STORE_CATEGORIES,
    STORE_RECURRING_RULES,
    STORE_TRANSACTIONS,
    type StoreName,
} from "@/lib/constants";
import { toIsoString } from "@/lib/utils";
import { forceDeleteDb, getDb } from "./connection";
import type { Category, RecurringRule, Transaction } from "./types";

async function purgeStore(
    storeName: StoreName,
    cutoffIso: string,
): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
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

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
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
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, "readonly");
        const request = tx.objectStore(STORE_CATEGORIES).getAll();
        request.onsuccess = () => resolve(request.result as Category[]);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllRecurringRulesForSync(): Promise<RecurringRule[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_RECURRING_RULES, "readonly");
        const request = tx.objectStore(STORE_RECURRING_RULES).getAll();
        request.onsuccess = () => resolve(request.result as RecurringRule[]);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllTransactions(): Promise<Transaction[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_TRANSACTIONS, "readonly");
        const request = tx.objectStore(STORE_TRANSACTIONS).getAll();
        request.onsuccess = () => resolve(request.result as Transaction[]);
        request.onerror = () => reject(request.error);
    });
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
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
        const store = tx.objectStore(STORE_TRANSACTIONS);
        for (const transaction of transactions) store.put(transaction);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
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
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, "readwrite");
        const store = tx.objectStore(STORE_CATEGORIES);
        for (const category of categories) store.put(category);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
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
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_RECURRING_RULES, "readwrite");
        const store = tx.objectStore(STORE_RECURRING_RULES);
        for (const rule of rules) store.put(rule);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function clearAllData(): Promise<void> {
    try {
        const db = await getDb();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(
                [STORE_CATEGORIES, STORE_RECURRING_RULES, STORE_TRANSACTIONS],
                "readwrite",
            );
            tx.objectStore(STORE_CATEGORIES).clear();
            tx.objectStore(STORE_RECURRING_RULES).clear();
            tx.objectStore(STORE_TRANSACTIONS).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        await forceDeleteDb();
    }
}
