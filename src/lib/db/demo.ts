import { DateTime } from "luxon";
import {
    STORE_CATEGORIES,
    STORE_RECURRING_RULES,
    STORE_TRANSACTIONS,
} from "@/lib/constants";
import { toIsoString } from "../utils";
import { getDb } from "./connection";
import { generateId } from "./uuid";

export async function seedDemoData(): Promise<void> {
    const db = await getDb();
    const now = DateTime.now();
    const threeDaysAgo = now.minus({ days: 3 });
    const yesterday = now.minus({ days: 1 });

    const auditNow = toIsoString(now.toUTC());
    const catCreatedAt = toIsoString(threeDaysAgo.toUTC());

    const catFood = generateId();
    const catVideogame = generateId();
    const catGrocery = generateId();
    const catFreelancing = generateId();
    const catWage = generateId();
    const catSubscription = generateId();

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(
            [STORE_CATEGORIES, STORE_TRANSACTIONS, STORE_RECURRING_RULES],
            "readwrite",
        );
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

        const catStore = tx.objectStore(STORE_CATEGORIES);
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
        catStore.put({
            id: catSubscription,
            name: "Subscription",
            colour: "#EC4899",
            icon: "📺",
            priority: 5,
            isBuckOnly: false,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });

        const yesterdayIso = toIsoString(yesterday);
        const todayIso = toIsoString(now);

        const txStore = tx.objectStore(STORE_TRANSACTIONS);
        txStore.put({
            id: generateId(),
            description: "Eggs",
            amount: 500,
            categoryId: catGrocery,
            isIncome: false,
            isBigBuck: false,
            transactedAt: yesterdayIso,
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
            transactedAt: yesterdayIso,
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
            transactedAt: todayIso,
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
            transactedAt: todayIso,
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
            transactedAt: yesterdayIso,
            year: yesterday.year,
            month: yesterday.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Poster design for LSPD",
            amount: 200000,
            categoryId: catFreelancing,
            isIncome: true,
            isBigBuck: true,
            transactedAt: todayIso,
            year: now.year,
            month: now.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Streaming service",
            amount: 1000,
            categoryId: catSubscription,
            isIncome: false,
            isBigBuck: false,
            transactedAt: todayIso,
            year: now.year,
            month: now.month,
            updatedAt: auditNow,
            deletedAt: null,
        });

        const rrStore = tx.objectStore(STORE_RECURRING_RULES);
        rrStore.put({
            id: generateId(),
            description: "Streaming service",
            amount: 1000,
            categoryId: catSubscription,
            isIncome: false,
            isBigBuck: false,
            frequency: "monthly",
            dayOfWeek: null,
            dayOfMonth: now.day,
            monthOfYear: null,
            lastGeneratedAt: auditNow,
            nextGenerationAt: toIsoString(now.plus({ months: 1 })),
            isActive: true,
            createdAt: auditNow,
            updatedAt: auditNow,
            deletedAt: null,
        });
    });
}
