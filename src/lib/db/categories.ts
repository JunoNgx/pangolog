import { RO, RW, STORE_CATEGORIES } from "@/lib/constants";
import { utcNowString } from "../utils";
import { getDb } from "./connection";
import type { Category, CategoryInput, CategoryUpdate } from "./types";
import { generateId } from "./uuid";

export async function createCategory(input: CategoryInput): Promise<Category> {
    const db = await getDb();
    const now = utcNowString();

    const category: Category = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        ...input,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, RW);
        const store = tx.objectStore(STORE_CATEGORIES);
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
        const tx = db.transaction(STORE_CATEGORIES, RW);
        const store = tx.objectStore(STORE_CATEGORIES);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedCategory: Category | undefined = getReq.result;
            if (!storedCategory) {
                reject(new Error(`Category ${id} not found`));
                return;
            }

            const updatedCategory: Category = {
                ...storedCategory,
                ...input,
                id: storedCategory.id,
                createdAt: storedCategory.createdAt,
                deletedAt: storedCategory.deletedAt,
                updatedAt: utcNowString(),
            };

            const putReq = store.put(updatedCategory);
            putReq.onsuccess = () => resolve(updatedCategory);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function deleteCategory(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, RW);
        const store = tx.objectStore(STORE_CATEGORIES);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedCategory: Category | undefined = getReq.result;
            if (!storedCategory) {
                reject(new Error(`Category ${id} not found`));
                return;
            }

            const now = utcNowString();
            const updatedCategory: Category = {
                ...storedCategory,
                deletedAt: now,
                updatedAt: now,
            };

            const putReq = store.put(updatedCategory);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function restoreCategory(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, RW);
        const store = tx.objectStore(STORE_CATEGORIES);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedCategory: Category | undefined = getReq.result;
            if (!storedCategory) {
                reject(new Error(`Category ${id} not found`));
                return;
            }

            const putReq = store.put({
                ...storedCategory,
                deletedAt: null,
                updatedAt: utcNowString(),
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
    const now = utcNowString();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, RW);
        const store = tx.objectStore(STORE_CATEGORIES);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

        for (const { id, priority } of updates) {
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const storedCategory: Category | undefined = getReq.result;
                if (storedCategory) {
                    store.put({ ...storedCategory, priority, updatedAt: now });
                }
            };
        }
    });
}

export async function getAllCategories(): Promise<Category[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, RO);
        const store = tx.objectStore(STORE_CATEGORIES);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: Category[] = request.result.filter(
                (c: Category) => c.deletedAt === null,
            );
            resolve(results);
        };
    });
}
