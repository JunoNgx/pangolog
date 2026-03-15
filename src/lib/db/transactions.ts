import { DateTime } from "luxon";
import { getDb } from "./connection";
import type { Transaction, TransactionInput, TransactionUpdate } from "./types";
import { generateId } from "./uuid";

export async function createTransaction(
    input: TransactionInput,
): Promise<Transaction> {
    const db = await getDb();
    const now = DateTime.now().toUTC().toISO()!;
    const dt = DateTime.fromISO(input.transactedAt);

    const transaction: Transaction = {
        id: generateId(),
        updatedAt: now,
        deletedAt: null,
        year: dt.year,
        month: dt.month,
        ...input,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        const request = store.add(transaction);
        request.onsuccess = () => resolve(transaction);
        request.onerror = () => reject(request.error);
    });
}

export async function updateTransaction(
    id: string,
    input: TransactionUpdate,
): Promise<Transaction> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Transaction | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Transaction ${id} not found`));
                return;
            }

            const transactedAt = input.transactedAt ?? existing.transactedAt;
            const dt = DateTime.fromISO(transactedAt);
            const updated: Transaction = {
                ...existing,
                ...input,
                id: existing.id,
                transactedAt,
                deletedAt: existing.deletedAt,
                year: dt.year,
                month: dt.month,
                updatedAt: DateTime.now().toUTC().toISO()!,
            };

            const putReq = store.put(updated);
            putReq.onsuccess = () => resolve(updated);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function deleteTransaction(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Transaction | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Transaction ${id} not found`));
                return;
            }

            const now = DateTime.now().toUTC().toISO()!;
            const updated: Transaction = {
                ...existing,
                deletedAt: now,
                updatedAt: now,
            };

            const putReq = store.put(updated);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function restoreTransaction(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Transaction | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Transaction ${id} not found`));
                return;
            }

            const putReq = store.put({
                ...existing,
                deletedAt: null,
                updatedAt: DateTime.now().toUTC().toISO()!,
            });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function getTransactionsByMonth(
    year: number,
    month: number,
): Promise<Transaction[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readonly");
        const store = tx.objectStore("transactions");
        const index = store.index("yearMonth");
        const request = index.getAll(IDBKeyRange.only([year, month]));

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Transaction[] = request.result.filter(
                (t: Transaction) => t.deletedAt === null,
            );
            resolve(results);
        };
    });
}

export async function getTransactionsByYear(
    year: number,
): Promise<Transaction[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readonly");
        const store = tx.objectStore("transactions");
        const index = store.index("yearMonth");
        const range = IDBKeyRange.bound([year, 1], [year, 12]);
        const request = index.getAll(range);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Transaction[] = request.result.filter(
                (t: Transaction) => t.deletedAt === null,
            );
            resolve(results);
        };
    });
}
