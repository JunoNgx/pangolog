import { getDb } from "./connection";
import type { Buck, Category, Dime } from "./types";

const PURGE_DAYS = 30;

async function purgeStore(
    storeName: "dimes" | "bucks" | "categories",
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
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - PURGE_DAYS);
    const cutoffIso = cutoff.toISOString();

    await Promise.all([
        purgeStore("dimes", cutoffIso),
        purgeStore("bucks", cutoffIso),
        purgeStore("categories", cutoffIso),
    ]);
}

export async function getAllDimesForSync(): Promise<Dime[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readonly");
        const request = tx.objectStore("dimes").getAll();
        request.onsuccess = () => resolve(request.result as Dime[]);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllBucksForSync(): Promise<Buck[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readonly");
        const request = tx.objectStore("bucks").getAll();
        request.onsuccess = () => resolve(request.result as Buck[]);
        request.onerror = () => reject(request.error);
    });
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

export async function bulkPutDimes(dimes: Dime[]): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readwrite");
        const store = tx.objectStore("dimes");
        for (const dime of dimes) store.put(dime);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function bulkPutBucks(bucks: Buck[]): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readwrite");
        const store = tx.objectStore("bucks");
        for (const buck of bucks) store.put(buck);
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
