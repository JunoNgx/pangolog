import { DateTime } from "luxon";
import { forceDeleteDb, getDb } from "./connection";
import type { Category, RecurringRule, Transaction } from "./types";

const PURGE_DAYS = 60;

async function purgeStore(
    storeName: "categories" | "recurring-rules" | "transactions",
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
    const cutoffIso = DateTime.now()
        .minus({ days: PURGE_DAYS })
        .toUTC()
        .toISO()!;

    await Promise.all([
        purgeStore("categories", cutoffIso),
        purgeStore("recurring-rules", cutoffIso),
        purgeStore("transactions", cutoffIso),
    ]);
}

export async function getAllCategoriesForSync(): Promise<Category[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readonly");
        const request = tx.objectStore("categories").getAll();
        request.onsuccess = () => resolve(request.result as Category[]);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllRecurringRulesForSync(): Promise<RecurringRule[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readonly");
        const request = tx.objectStore("recurring-rules").getAll();
        request.onsuccess = () => resolve(request.result as RecurringRule[]);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllTransactionsForSync(): Promise<Transaction[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readonly");
        const request = tx.objectStore("transactions").getAll();
        request.onsuccess = () => resolve(request.result as Transaction[]);
        request.onerror = () => reject(request.error);
    });
}

export async function bulkPutTransactions(
    transactions: Transaction[],
): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        for (const transaction of transactions) store.put(transaction);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function bulkPutCategories(categories: Category[]): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        for (const category of categories) store.put(category);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function bulkPutRecurringRules(
    rules: RecurringRule[],
): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readwrite");
        const store = tx.objectStore("recurring-rules");
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
                ["categories", "recurring-rules", "transactions"],
                "readwrite",
            );
            tx.objectStore("categories").clear();
            tx.objectStore("recurring-rules").clear();
            tx.objectStore("transactions").clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        await forceDeleteDb();
    }
}
