import { RO, RW, STORE_CATEGORIES } from "@/lib/constants";
import { utcNowString } from "../utils";
import { getDb } from "./connection";
import {
    openStore,
    performIdbRequest,
    performIdbUpdate,
    performTransaction,
} from "./idbHelpers";
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

    await performIdbRequest(
        openStore({ db, storeName: STORE_CATEGORIES, mode: RW }).add(category),
    );
    return category;
}

export async function updateCategory(
    id: string,
    input: CategoryUpdate,
): Promise<Category> {
    const db = await getDb();

    return performIdbUpdate({
        db,
        storeName: STORE_CATEGORIES,
        id,
        updater: (storedCategory) => ({
            ...storedCategory,
            ...input,
            id: storedCategory.id,
            createdAt: storedCategory.createdAt,
            deletedAt: storedCategory.deletedAt,
            updatedAt: utcNowString(),
        }),
    });
}

export async function deleteCategory(id: string): Promise<void> {
    const db = await getDb();

    await performIdbUpdate({
        db,
        storeName: STORE_CATEGORIES,
        id,
        updater: (storedCategory) => ({
            ...storedCategory,
            deletedAt: utcNowString(),
            updatedAt: utcNowString(),
        }),
    });
}

export async function restoreCategory(id: string): Promise<void> {
    const db = await getDb();

    await performIdbUpdate({
        db,
        storeName: STORE_CATEGORIES,
        id,
        updater: (storedCategory) => ({
            ...storedCategory,
            deletedAt: null,
            updatedAt: utcNowString(),
        }),
    });
}

export async function reorderCategories(
    updates: { id: string; priority: number }[],
): Promise<void> {
    const db = await getDb();
    const now = utcNowString();

    const tx = db.transaction(STORE_CATEGORIES, RW);
    const store = tx.objectStore(STORE_CATEGORIES);

    for (const { id, priority } of updates) {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const storedCategory: Category | undefined = getReq.result;
            if (storedCategory) {
                store.put({
                    ...storedCategory,
                    priority,
                    updatedAt: now,
                });
            }
        };
    }

    await performTransaction(tx);
}

export async function getAllCategories(): Promise<Category[]> {
    const db = await getDb();

    const results = await performIdbRequest(
        openStore({ db, storeName: STORE_CATEGORIES, mode: RO }).getAll(),
    );

    return results.filter((category: Category) => category.deletedAt === null);
}
