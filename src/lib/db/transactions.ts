import { DateTime } from "luxon";
import { STORE_TRANSACTIONS } from "@/lib/constants";
import { utcNowString } from "../utils";
import { getDb } from "./connection";
import type { Transaction, TransactionInput, TransactionUpdate } from "./types";
import { generateId } from "./uuid";

export async function createTransaction(
    input: TransactionInput,
): Promise<Transaction> {
    const db = await getDb();
    const now = utcNowString();
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
        const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
        const store = tx.objectStore(STORE_TRANSACTIONS);
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
        const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
        const store = tx.objectStore(STORE_TRANSACTIONS);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedTransaction: Transaction | undefined = getReq.result;
            if (!storedTransaction) {
                reject(new Error(`Transaction ${id} not found`));
                return;
            }

            const transactedAt =
                input.transactedAt ?? storedTransaction.transactedAt;
            const dt = DateTime.fromISO(transactedAt);
            const updatedTransaction: Transaction = {
                ...storedTransaction,
                ...input,
                id: storedTransaction.id,
                transactedAt,
                deletedAt: storedTransaction.deletedAt,
                year: dt.year,
                month: dt.month,
                updatedAt: utcNowString(),
            };

            const putReq = store.put(updatedTransaction);
            putReq.onsuccess = () => resolve(updatedTransaction);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function deleteTransaction(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
        const store = tx.objectStore(STORE_TRANSACTIONS);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedTransaction: Transaction | undefined = getReq.result;
            if (!storedTransaction) {
                reject(new Error(`Transaction ${id} not found`));
                return;
            }

            const now = utcNowString();
            const updatedTransaction: Transaction = {
                ...storedTransaction,
                deletedAt: now,
                updatedAt: now,
            };

            const putReq = store.put(updatedTransaction);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function restoreTransaction(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_TRANSACTIONS, "readwrite");
        const store = tx.objectStore(STORE_TRANSACTIONS);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedTransaction: Transaction | undefined = getReq.result;
            if (!storedTransaction) {
                reject(new Error(`Transaction ${id} not found`));
                return;
            }

            const putReq = store.put({
                ...storedTransaction,
                deletedAt: null,
                updatedAt: utcNowString(),
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
        const tx = db.transaction(STORE_TRANSACTIONS, "readonly");
        const store = tx.objectStore(STORE_TRANSACTIONS);
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
        const tx = db.transaction(STORE_TRANSACTIONS, "readonly");
        const store = tx.objectStore(STORE_TRANSACTIONS);
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
