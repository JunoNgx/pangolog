import { getDb } from "./connection";
import type {
    RecurringRule,
    RecurringRuleInput,
    RecurringRuleUpdate,
} from "./types";
import { generateId } from "./uuid";

export async function createRecurringRule(
    input: RecurringRuleInput,
): Promise<RecurringRule> {
    const db = await getDb();
    const now = new Date().toISOString();

    const rule: RecurringRule = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        lastGeneratedAt: null,
        ...input,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readwrite");
        const store = tx.objectStore("recurring-rules");
        const request = store.add(rule);
        request.onsuccess = () => resolve(rule);
        request.onerror = () => reject(request.error);
    });
}

export async function updateRecurringRule(
    id: string,
    input: RecurringRuleUpdate,
): Promise<RecurringRule> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readwrite");
        const store = tx.objectStore("recurring-rules");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: RecurringRule | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`RecurringRule ${id} not found`));
                return;
            }

            const updated: RecurringRule = {
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

export async function deleteRecurringRule(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readwrite");
        const store = tx.objectStore("recurring-rules");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: RecurringRule | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`RecurringRule ${id} not found`));
                return;
            }

            const now = new Date().toISOString();
            const putReq = store.put({
                ...existing,
                deletedAt: now,
                updatedAt: now,
            });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function restoreRecurringRule(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readwrite");
        const store = tx.objectStore("recurring-rules");
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const existing: RecurringRule | undefined = getReq.result;
            if (!existing) {
                reject(new Error(`RecurringRule ${id} not found`));
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

export async function getAllRecurringRules(): Promise<RecurringRule[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readonly");
        const store = tx.objectStore("recurring-rules");
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: RecurringRule[] = request.result.filter(
                (r: RecurringRule) => r.deletedAt === null,
            );
            resolve(results);
        };
    });
}

export async function getDueRecurringRules(): Promise<RecurringRule[]> {
    const db = await getDb();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("recurring-rules", "readonly");
        const store = tx.objectStore("recurring-rules");
        const index = store.index("nextGenerationAt");
        const request = index.getAll(IDBKeyRange.upperBound(now));

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: RecurringRule[] = request.result.filter(
                (r: RecurringRule) => r.deletedAt === null && r.isActive,
            );
            resolve(results);
        };
    });
}
