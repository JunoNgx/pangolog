import { DateTime } from "luxon";
import { getDb } from "./connection";
import type { Buck, BuckInput, BuckUpdate } from "./types";
import { generateId } from "./uuid";

export async function createBuck(input: BuckInput): Promise<Buck> {
    const db = await getDb();
    const now = DateTime.now().toUTC().toISO()!;

    const buck: Buck = {
        id: generateId(),
        updatedAt: now,
        deletedAt: null,
        year: DateTime.fromISO(input.transactedAt).year,
        ...input,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readwrite");
        const store = tx.objectStore("bucks");
        const request = store.add(buck);
        request.onsuccess = () => resolve(buck);
        request.onerror = () => reject(request.error);
    });
}

export async function updateBuck(id: string, input: BuckUpdate): Promise<Buck> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readwrite");
        const store = tx.objectStore("bucks");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Buck | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Buck ${id} not found`));
                return;
            }

            const transactedAt = input.transactedAt ?? existing.transactedAt;
            const updated: Buck = {
                ...existing,
                ...input,
                id: existing.id,
                transactedAt,
                deletedAt: existing.deletedAt,
                year: DateTime.fromISO(transactedAt).year,
                updatedAt: DateTime.now().toUTC().toISO()!,
            };

            const putReq = store.put(updated);
            putReq.onsuccess = () => resolve(updated);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function deleteBuck(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readwrite");
        const store = tx.objectStore("bucks");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Buck | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Buck ${id} not found`));
                return;
            }

            const now = DateTime.now().toUTC().toISO()!;
            const updated: Buck = {
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

export async function restoreBuck(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readwrite");
        const store = tx.objectStore("bucks");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Buck | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Buck ${id} not found`));
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

export async function getBucksByYear(year: number): Promise<Buck[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readonly");
        const store = tx.objectStore("bucks");
        const index = store.index("year");
        const request = index.getAll(IDBKeyRange.only(year));

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Buck[] = request.result.filter(
                (b: Buck) => b.deletedAt === null,
            );
            resolve(results);
        };
    });
}

export async function getBucksByMonth(
    year: number,
    month: number,
): Promise<Buck[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("bucks", "readonly");
        const store = tx.objectStore("bucks");
        const index = store.index("yearMonth");
        const request = index.getAll(IDBKeyRange.only([year, month]));

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Buck[] = request.result.filter(
                (b: Buck) => b.deletedAt === null,
            );
            resolve(results);
        };
    });
}
