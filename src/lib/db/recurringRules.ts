import { DateTime } from "luxon";
import { RO, RW, STORE_RECURRING_RULES } from "@/lib/constants";
import { isOnOrBeforeToday, utcNowString } from "../utils";
import { getDb } from "./connection";
import { openStore, performIdbRequest, performIdbUpdate } from "./idbHelpers";
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

    await performIdbRequest(
        openStore({ db, storeName: STORE_RECURRING_RULES, mode: RW }).add(rule),
    );
    return rule;
}

export async function updateRecurringRule(
    id: string,
    input: RecurringRuleUpdate,
): Promise<RecurringRule> {
    const db = await getDb();

    return performIdbUpdate({
        db,
        storeName: STORE_RECURRING_RULES,
        id,
        updater: (storedRule) => ({
            ...storedRule,
            ...input,
            id: storedRule.id,
            createdAt: storedRule.createdAt,
            deletedAt: storedRule.deletedAt,
            updatedAt: utcNowString(),
        }),
    });
}

export async function deleteRecurringRule(id: string): Promise<void> {
    const db = await getDb();

    await performIdbUpdate({
        db,
        storeName: STORE_RECURRING_RULES,
        id,
        updater: (storedRule) => ({
            ...storedRule,
            deletedAt: utcNowString(),
            updatedAt: utcNowString(),
        }),
    });
}

export async function restoreRecurringRule(id: string): Promise<void> {
    const db = await getDb();

    await performIdbUpdate({
        db,
        storeName: STORE_RECURRING_RULES,
        id,
        updater: (storedRule) => ({
            ...storedRule,
            deletedAt: null,
            updatedAt: utcNowString(),
        }),
    });
}

export async function advanceRecurringRule(
    id: string,
    nextGenerationAt: string,
    lastGeneratedAt: string,
): Promise<void> {
    const db = await getDb();

    await performIdbUpdate({
        db,
        storeName: STORE_RECURRING_RULES,
        id,
        updater: (storedRule) => ({
            ...storedRule,
            nextGenerationAt,
            lastGeneratedAt,
            // updatedAt is intentionally NOT changed - this is an operational
            // update, not a user action, so it must not win sync conflicts
            // over explicit user changes (e.g. deactivating a rule).
        }),
    });
}

export async function getAllRecurringRules(): Promise<RecurringRule[]> {
    const db = await getDb();

    const results = await performIdbRequest(
        openStore({ db, storeName: STORE_RECURRING_RULES, mode: RO }).getAll(),
    );

    return results.filter((rule: RecurringRule) => rule.deletedAt === null);
}

export async function getDueRecurringRules(): Promise<RecurringRule[]> {
    const db = await getDb();

    const results = await performIdbRequest(
        openStore({ db, storeName: STORE_RECURRING_RULES, mode: RO }).getAll(),
    );

    return results.filter(
        (rule: RecurringRule) =>
            rule.deletedAt === null &&
            rule.isActive &&
            isOnOrBeforeToday(DateTime.fromISO(rule.nextGenerationAt)),
    );
}
