import { DateTime } from "luxon";
import { generateId } from "./uuid";

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

                const getAllDimes = upgradeTx.objectStore("dimes").getAll();
                getAllDimes.onsuccess = () => {
                    for (const dime of getAllDimes.result) {
                        txStore.put({ ...dime, isBigBuck: false });
                    }
                    db.deleteObjectStore("dimes");
                };

                const getAllBucks = upgradeTx.objectStore("bucks").getAll();
                getAllBucks.onsuccess = () => {
                    for (const buck of getAllBucks.result) {
                        txStore.put({ ...buck, isBigBuck: true });
                    }
                    db.deleteObjectStore("bucks");
                };

                if (event.oldVersion === 0) {
                    seedDemoData(upgradeTx);
                }
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

function seedDemoData(upgradeTx: IDBTransaction): void {
    const now = DateTime.now();
    const threeDaysAgo = now.minus({ days: 3 });
    const yesterday = now.minus({ days: 1 });

    const auditNow = now.toUTC().toISO()!;
    const catCreatedAt = threeDaysAgo.toUTC().toISO()!;

    const catFood = generateId();
    const catVideogame = generateId();
    const catGrocery = generateId();
    const catFreelancing = generateId();
    const catWage = generateId();

    const catStore = upgradeTx.objectStore("categories");
    catStore.put({
        id: catFood,
        name: "Food",
        colour: "#F97316",
        icon: "🍔",
        priority: 0,
        isBuckOnly: false,
        isIncomeOnly: false,
        createdAt: catCreatedAt,
        updatedAt: catCreatedAt,
        deletedAt: null,
    });
    catStore.put({
        id: catVideogame,
        name: "Videogame",
        colour: "#8B5CF6",
        icon: "🎮",
        priority: 1,
        isBuckOnly: true,
        isIncomeOnly: false,
        createdAt: catCreatedAt,
        updatedAt: catCreatedAt,
        deletedAt: null,
    });
    catStore.put({
        id: catGrocery,
        name: "Grocery",
        colour: "#22C55E",
        icon: "🛒",
        priority: 2,
        isBuckOnly: false,
        isIncomeOnly: false,
        createdAt: catCreatedAt,
        updatedAt: catCreatedAt,
        deletedAt: null,
    });
    catStore.put({
        id: catFreelancing,
        name: "Freelancing",
        colour: "#3B82F6",
        icon: "💼",
        priority: 3,
        isBuckOnly: false,
        isIncomeOnly: true,
        createdAt: catCreatedAt,
        updatedAt: catCreatedAt,
        deletedAt: null,
    });
    catStore.put({
        id: catWage,
        name: "Wage",
        colour: "#14B8A6",
        icon: "💰",
        priority: 4,
        isBuckOnly: false,
        isIncomeOnly: true,
        createdAt: catCreatedAt,
        updatedAt: catCreatedAt,
        deletedAt: null,
    });

    const yesterdayISO = yesterday.toISO()!;
    const todayISO = now.toISO()!;

    const txStore = upgradeTx.objectStore("transactions");
    txStore.put({
        id: generateId(),
        description: "Eggs",
        amount: 500,
        categoryId: catGrocery,
        isIncome: false,
        isBigBuck: false,
        transactedAt: yesterdayISO,
        year: yesterday.year,
        month: yesterday.month,
        updatedAt: auditNow,
        deletedAt: null,
    });
    txStore.put({
        id: generateId(),
        description: "Sandwich",
        amount: 1200,
        categoryId: catFood,
        isIncome: false,
        isBigBuck: false,
        transactedAt: yesterdayISO,
        year: yesterday.year,
        month: yesterday.month,
        updatedAt: auditNow,
        deletedAt: null,
    });
    txStore.put({
        id: generateId(),
        description: "Chinese noodle",
        amount: 2000,
        categoryId: catFood,
        isIncome: false,
        isBigBuck: false,
        transactedAt: todayISO,
        year: now.year,
        month: now.month,
        updatedAt: auditNow,
        deletedAt: null,
    });
    txStore.put({
        id: generateId(),
        description: "4U Gas payment",
        amount: 35000,
        categoryId: catWage,
        isIncome: true,
        isBigBuck: false,
        transactedAt: todayISO,
        year: now.year,
        month: now.month,
        updatedAt: auditNow,
        deletedAt: null,
    });
    txStore.put({
        id: generateId(),
        description: "What Remains of Edith Finch",
        amount: 2000,
        categoryId: catVideogame,
        isIncome: false,
        isBigBuck: true,
        transactedAt: yesterdayISO,
        year: yesterday.year,
        month: yesterday.month,
        updatedAt: auditNow,
        deletedAt: null,
    });
    txStore.put({
        id: generateId(),
        description: "Poster design for LSPD",
        amount: 20000,
        categoryId: catFreelancing,
        isIncome: true,
        isBigBuck: true,
        transactedAt: todayISO,
        year: now.year,
        month: now.month,
        updatedAt: auditNow,
        deletedAt: null,
    });

}
