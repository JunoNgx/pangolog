import { getDb } from "./connection";
import type { Category, CategoryInput, CategoryUpdate } from "./types";

export async function createCategory(input: CategoryInput): Promise<Category> {
    const db = await getDb();
    const now = new Date().toISOString();

    const category: Category = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        ...input,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        const request = store.add(category);
        request.onsuccess = () => resolve(category);
        request.onerror = () => reject(request.error);
    });
}

export async function updateCategory(
    id: string,
    input: CategoryUpdate,
): Promise<Category> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Category | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Category ${id} not found`));
                return;
            }

            const updated: Category = {
                ...existing,
                ...input,
                id: existing.id,
                createdAt: existing.createdAt,
                deletedAt: existing.deletedAt,
                updatedAt: new Date().toISOString(),
            };

            const putReq = store.put(updated);
            putReq.onsuccess = () => resolve(updated);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function deleteCategory(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Category | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Category ${id} not found`));
                return;
            }

            const now = new Date().toISOString();
            const updated: Category = {
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

export async function restoreCategory(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: Category | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`Category ${id} not found`));
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

export async function reorderCategories(
    updates: { id: string; priority: number }[],
): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

        for (const { id, priority } of updates) {
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const existing: Category | undefined = getReq.result;
                if (existing) {
                    store.put({ ...existing, priority, updatedAt: now });
                }
            };
        }
    });
}

export async function getAllCategories(): Promise<Category[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("categories", "readonly");
        const store = tx.objectStore("categories");
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Category[] = request.result
                .filter((c: Category) => c.deletedAt === null)
                .sort((a: Category, b: Category) => a.priority - b.priority);
            resolve(results);
        };
    });
}
