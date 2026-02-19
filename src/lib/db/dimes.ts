import { getDb } from "./connection";
import type { Dime, DimeInput, DimeUpdate } from "./types";

export async function createDime(input: DimeInput): Promise<Dime> {
    const db = await getDb();
    const now = new Date().toISOString();
    const date = new Date(input.transactedAt);

    const dime: Dime = {
        id: crypto.randomUUID(),
        updatedAt: now,
        deletedAt: null,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        ...input,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readwrite");
        const store = tx.objectStore("dimes");
        const request = store.add(dime);
        request.onsuccess = () => resolve(dime);
        request.onerror = () => reject(request.error);
    });
}

export async function updateDime(id: string, input: DimeUpdate): Promise<Dime> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readwrite");
        const store = tx.objectStore("dimes");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Dime | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Dime ${id} not found`));
                return;
            }

            const transactedAt = input.transactedAt ?? existing.transactedAt;
            const date = new Date(transactedAt);
            const updated: Dime = {
                ...existing,
                ...input,
                id: existing.id,
                transactedAt,
                deletedAt: existing.deletedAt,
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                updatedAt: new Date().toISOString(),
            };

            const putReq = store.put(updated);
            putReq.onsuccess = () => resolve(updated);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function deleteDime(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readwrite");
        const store = tx.objectStore("dimes");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Dime | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Dime ${id} not found`));
                return;
            }

            const now = new Date().toISOString();
            const updated: Dime = {
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

export async function restoreDime(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readwrite");
        const store = tx.objectStore("dimes");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Dime | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Dime ${id} not found`));
                return;
            }

            const putReq = store.put({
                ...existing,
                deletedAt: null,
                updatedAt: new Date().toISOString(),
            });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function getDimesByYear(year: number): Promise<Dime[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readonly");
        const store = tx.objectStore("dimes");
        const index = store.index("yearMonth");
        const range = IDBKeyRange.bound([year, 1], [year, 12]);
        const request = index.getAll(range);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Dime[] = request.result.filter(
                (d: Dime) => d.deletedAt === null,
            );
            resolve(results);
        };
    });
}

export async function getDimesByMonth(
    year: number,
    month: number,
): Promise<Dime[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("dimes", "readonly");
        const store = tx.objectStore("dimes");
        const index = store.index("yearMonth");
        const request = index.getAll(IDBKeyRange.only([year, month]));

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Dime[] = request.result.filter(
                (d: Dime) => d.deletedAt === null,
            );
            resolve(results);
        };
    });
}
