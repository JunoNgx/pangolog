import { DateTime } from "luxon";

const DB_NAME = "pangolog";
const DB_VERSION = 4;

const REQUIRED_STORES = ["categories", "recurring-rules", "transactions"];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDbRaw(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onupgradeneeded = (event) => {
            const db = request.result;

            if (event.oldVersion < 1) {
                const dimes = db.createObjectStore("dimes", { keyPath: "id" });
                dimes.createIndex("yearMonth", ["year", "month"]);
                dimes.createIndex("categoryId", "categoryId");
                dimes.createIndex("transactedAt", "transactedAt");

                const bucks = db.createObjectStore("bucks", { keyPath: "id" });
                bucks.createIndex("year", "year");
                bucks.createIndex("categoryId", "categoryId");
                bucks.createIndex("transactedAt", "transactedAt");

                const categories = db.createObjectStore("categories", {
                    keyPath: "id",
                });
                categories.createIndex("createdAt", "createdAt");

                db.createObjectStore("recurring-rules", { keyPath: "id" });
            }

            if (event.oldVersion < 2) {
                const upgradeTx = (event.target as IDBOpenDBRequest)
                    .transaction;
                if (!upgradeTx) return;
                const rules = upgradeTx.objectStore("recurring-rules");
                rules.createIndex("nextGenerationAt", "nextGenerationAt");
                rules.createIndex("createdAt", "createdAt");
            }

            if (event.oldVersion < 3) {
                const upgradeTx = (event.target as IDBOpenDBRequest)
                    .transaction;
                if (!upgradeTx) return;
                const bucksStore = upgradeTx.objectStore("bucks");
                bucksStore.createIndex("yearMonth", ["year", "month"]);

                const buckCursor = bucksStore.openCursor();
                buckCursor.onsuccess = (e) => {
                    const cursor = (e.target as IDBRequest<IDBCursorWithValue>)
                        .result;
                    if (!cursor) return;
                    cursor.update({
                        ...cursor.value,
                        month: DateTime.fromISO(cursor.value.transactedAt)
                            .month,
                        isBigBuck: true,
                    });
                    cursor.continue();
                };

                const dimesStore = upgradeTx.objectStore("dimes");
                const dimeCursor = dimesStore.openCursor();
                dimeCursor.onsuccess = (e) => {
                    const cursor = (e.target as IDBRequest<IDBCursorWithValue>)
                        .result;
                    if (!cursor) return;
                    cursor.update({ ...cursor.value, isBigBuck: false });
                    cursor.continue();
                };
            }

            if (event.oldVersion < 4) {
                const upgradeTx = (event.target as IDBOpenDBRequest)
                    .transaction;
                if (!upgradeTx) return;

                const transactions = db.createObjectStore("transactions", {
                    keyPath: "id",
                });
                transactions.createIndex("yearMonth", ["year", "month"]);
                transactions.createIndex("year", "year");
                transactions.createIndex("categoryId", "categoryId");
                transactions.createIndex("transactedAt", "transactedAt");

                const txStore = upgradeTx.objectStore("transactions");

                const dimesStore2 = upgradeTx.objectStore("dimes");
                const dimeCursor2 = dimesStore2.openCursor();
                dimeCursor2.onsuccess = (e) => {
                    const cursor = (e.target as IDBRequest<IDBCursorWithValue>)
                        .result;
                    if (!cursor) return;
                    txStore.put({ ...cursor.value, isBigBuck: false });
                    cursor.continue();
                };

                const bucksStore2 = upgradeTx.objectStore("bucks");
                const buckCursor2 = bucksStore2.openCursor();
                buckCursor2.onsuccess = (e) => {
                    const cursor = (e.target as IDBRequest<IDBCursorWithValue>)
                        .result;
                    if (!cursor) return;
                    txStore.put({ ...cursor.value, isBigBuck: true });
                    cursor.continue();
                };

                db.deleteObjectStore("dimes");
                db.deleteObjectStore("bucks");
            }
        };

        request.onsuccess = () => resolve(request.result);
    });
}

function deleteDbRaw(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => resolve();
    });
}

export async function forceDeleteDb(): Promise<void> {
    dbPromise = null;
    await deleteDbRaw();
}

export function getDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = openDbRaw()
        .then(async (db) => {
            const allPresent = REQUIRED_STORES.every((s) =>
                db.objectStoreNames.contains(s),
            );
            if (allPresent) return db;

            // Browser partial-clear left the DB at the current version but
            // wiped the object stores. Delete and recreate from scratch.
            db.close();
            await deleteDbRaw();
            return openDbRaw();
        })
        .catch((err) => {
            dbPromise = null;
            throw err;
        });

    return dbPromise;
}
