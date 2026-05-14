import { DateTime } from "luxon";
import { STORE_RECURRING_RULES } from "@/lib/constants";
import { todayDateString, toIsoDateString, utcNowString } from "../utils";
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
    const now = utcNowString();

    const rule: RecurringRule = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        lastGeneratedAt: null,
        ...input,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_RECURRING_RULES, "readwrite");
        const store = tx.objectStore(STORE_RECURRING_RULES);
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
        const tx = db.transaction(STORE_RECURRING_RULES, "readwrite");
        const store = tx.objectStore(STORE_RECURRING_RULES);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedRule: RecurringRule | undefined = getReq.result;
            if (!storedRule) {
                reject(new Error(`RecurringRule ${id} not found`));
                return;
            }

            const updatedRule: RecurringRule = {
                ...storedRule,
                ...input,
                id: storedRule.id,
                createdAt: storedRule.createdAt,
                deletedAt: storedRule.deletedAt,
                updatedAt: utcNowString(),
            };

            const putReq = store.put(updatedRule);
            putReq.onsuccess = () => resolve(updatedRule);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function deleteRecurringRule(id: string): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_RECURRING_RULES, "readwrite");
        const store = tx.objectStore(STORE_RECURRING_RULES);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedRule: RecurringRule | undefined = getReq.result;
            if (!storedRule) {
                reject(new Error(`RecurringRule ${id} not found`));
                return;
            }

            const now = utcNowString();
            const putReq = store.put({
                ...storedRule,
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
        const tx = db.transaction(STORE_RECURRING_RULES, "readwrite");
        const store = tx.objectStore(STORE_RECURRING_RULES);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedRule: RecurringRule | undefined = getReq.result;
            if (!storedRule) {
                reject(new Error(`RecurringRule ${id} not found`));
                return;
            }

            const putReq = store.put({
                ...storedRule,
                deletedAt: null,
                updatedAt: utcNowString(),
            });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function advanceRecurringRule(
    id: string,
    nextGenerationAt: string,
    lastGeneratedAt: string,
): Promise<void> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_RECURRING_RULES, "readwrite");
        const store = tx.objectStore(STORE_RECURRING_RULES);
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedRule: RecurringRule | undefined = getReq.result;
            if (!storedRule) {
                reject(new Error(`RecurringRule ${id} not found`));
                return;
            }

            const putReq = store.put({
                ...storedRule,
                nextGenerationAt,
                lastGeneratedAt,
                // updatedAt is intentionally NOT changed - this is an operational
                // update, not a user action, so it must not win sync conflicts
                // over explicit user changes (e.g. deactivating a rule).
            });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
    });
}

export async function getAllRecurringRules(): Promise<RecurringRule[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_RECURRING_RULES, "readonly");
        const store = tx.objectStore(STORE_RECURRING_RULES);
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
    const today = todayDateString();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_RECURRING_RULES, "readonly");
        const store = tx.objectStore(STORE_RECURRING_RULES);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const results: RecurringRule[] = request.result.filter(
                (r: RecurringRule) =>
                    r.deletedAt === null &&
                    r.isActive &&
                    toIsoDateString(DateTime.fromISO(r.nextGenerationAt)) <=
                        today,
            );
            resolve(results);
        };
    });
}
