const DB_NAME = "pangolog";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };

        request.onupgradeneeded = () => {
            const db = request.result;

            const dimes = db.createObjectStore("dimes", { keyPath: "id" });
            dimes.createIndex("yearMonth", ["year", "month"]);
            dimes.createIndex("categoryId", "categoryId");
            dimes.createIndex("createdAt", "createdAt");

            const bucks = db.createObjectStore("bucks", { keyPath: "id" });
            bucks.createIndex("year", "year");
            bucks.createIndex("categoryId", "categoryId");
            bucks.createIndex("createdAt", "createdAt");

            const categories = db.createObjectStore("categories", {
                keyPath: "id",
            });
            categories.createIndex("createdAt", "createdAt");

            db.createObjectStore("recurring-rules", { keyPath: "id" });
        };

        request.onsuccess = () => {
            resolve(request.result);
        };
    });

    return dbPromise;
}
