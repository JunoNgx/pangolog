import { DateTime } from "luxon";
import { RO, RW, STORE_TRANSACTIONS } from "@/lib/constants";
import { utcNowString } from "../utils";
import { getDb } from "./connection";
import { openStore, performIdbRequest, performIdbUpdate } from "./idbHelpers";
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

    await performIdbRequest(
        openStore({ db, storeName: STORE_TRANSACTIONS, mode: RW }).add(
            transaction,
        ),
    );
    return transaction;
}

export async function updateTransaction(
    id: string,
    input: TransactionUpdate,
): Promise<Transaction> {
    const db = await getDb();

    return performIdbUpdate({
        db,
        storeName: STORE_TRANSACTIONS,
        id,
        updater: (storedTransaction) => {
            const transactedAt =
                input.transactedAt ?? storedTransaction.transactedAt;
            const dt = DateTime.fromISO(transactedAt);
            return {
                ...storedTransaction,
                ...input,
                id: storedTransaction.id,
                transactedAt,
                deletedAt: storedTransaction.deletedAt,
                year: dt.year,
                month: dt.month,
                updatedAt: utcNowString(),
            };
        },
    });
}

export async function deleteTransaction(id: string): Promise<void> {
    const db = await getDb();

    await performIdbUpdate({
        db,
        storeName: STORE_TRANSACTIONS,
        id,
        updater: (storedTransaction) => ({
            ...storedTransaction,
            deletedAt: utcNowString(),
            updatedAt: utcNowString(),
        }),
    });
}

export async function restoreTransaction(id: string): Promise<void> {
    const db = await getDb();

    await performIdbUpdate({
        db,
        storeName: STORE_TRANSACTIONS,
        id,
        updater: (storedTransaction) => ({
            ...storedTransaction,
            deletedAt: null,
            updatedAt: utcNowString(),
        }),
    });
}

export async function getTransactionsByMonth(
    year: number,
    month: number,
): Promise<Transaction[]> {
    const db = await getDb();

    const results = await performIdbRequest(
        openStore({ db, storeName: STORE_TRANSACTIONS, mode: RO })
            .index("yearMonth")
            .getAll(IDBKeyRange.only([year, month])),
    );

    return results.filter(
        (transaction: Transaction) => transaction.deletedAt === null,
    );
}

export async function getTransactionsByYear(
    year: number,
): Promise<Transaction[]> {
    const db = await getDb();

    const results = await performIdbRequest(
        openStore({ db, storeName: STORE_TRANSACTIONS, mode: RO })
            .index("yearMonth")
            .getAll(IDBKeyRange.bound([year, 1], [year, 12])),
    );

    return results.filter(
        (transaction: Transaction) => transaction.deletedAt === null,
    );
}
