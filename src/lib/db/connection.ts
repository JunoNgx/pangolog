const DB_NAME = "pangolog";
const DB_VERSION = 2;

const REQUIRED_STORES = ["dimes", "bucks", "categories", "recurring-rules"];

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
