import { DateTime } from "luxon";
import {
    RW,
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
    const twoDaysAgo = now.minus({ days: 2 });
    const yesterday = now.minus({ days: 1 });

    const auditNow = toIsoString(now.toUTC());
    const catCreatedAt = toIsoString(threeDaysAgo.toUTC());

    const threeDaysAgoIso = toIsoString(threeDaysAgo);
    const twoDaysAgoIso = toIsoString(twoDaysAgo);
    const yesterdayIso = toIsoString(yesterday);
    const todayIso = toIsoString(now);

    const catMedicine = generateId();
    const catDrink = generateId();
    const catFood = generateId();
    const catIncome = generateId();
    const catClothings = generateId();
    const catReading = generateId();
    const catHardware = generateId();
    const catRent = generateId();

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(
            [STORE_CATEGORIES, STORE_TRANSACTIONS, STORE_RECURRING_RULES],
            RW,
        );
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

        const catStore = tx.objectStore(STORE_CATEGORIES);
        catStore.put({
            id: catMedicine,
            name: "Medicine",
            colour: "#EF4444",
            icon: "💊",
            priority: 0,
            isBuckOnly: false,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });
        catStore.put({
            id: catDrink,
            name: "Drink",
            colour: "#FBBF24",
            icon: "🍺",
            priority: 1,
            isBuckOnly: false,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });
        catStore.put({
            id: catFood,
            name: "Food",
            colour: "#F97316",
            icon: "🥪",
            priority: 2,
            isBuckOnly: false,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });
        catStore.put({
            id: catIncome,
            name: "Income",
            colour: "#22C55E",
            icon: "💵",
            priority: 3,
            isBuckOnly: false,
            isIncomeOnly: true,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });
        catStore.put({
            id: catClothings,
            name: "Clothings",
            colour: "#EC4899",
            icon: "👕",
            priority: 4,
            isBuckOnly: true,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });
        catStore.put({
            id: catReading,
            name: "Reading",
            colour: "#3B82F6",
            icon: "📖",
            priority: 5,
            isBuckOnly: true,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });
        catStore.put({
            id: catHardware,
            name: "Hardware",
            colour: "#6B7280",
            icon: "🔧",
            priority: 6,
            isBuckOnly: true,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });
        catStore.put({
            id: catRent,
            name: "Rent",
            colour: "#8B5CF6",
            icon: "🏠",
            priority: 7,
            isBuckOnly: false,
            isIncomeOnly: false,
            createdAt: catCreatedAt,
            updatedAt: catCreatedAt,
            deletedAt: null,
        });

        const txStore = tx.objectStore(STORE_TRANSACTIONS);

        // Three days ago
        txStore.put({
            id: generateId(),
            description: "Nosaphed",
            amount: 270,
            categoryId: catMedicine,
            isIncome: false,
            isBigBuck: false,
            transactedAt: threeDaysAgoIso,
            year: threeDaysAgo.year,
            month: threeDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Commodore wine",
            amount: 500,
            categoryId: catDrink,
            isIncome: false,
            isBigBuck: false,
            transactedAt: threeDaysAgoIso,
            year: threeDaysAgo.year,
            month: threeDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Pilsner beer",
            amount: 300,
            categoryId: catDrink,
            isIncome: false,
            isBigBuck: false,
            transactedAt: threeDaysAgoIso,
            year: threeDaysAgo.year,
            month: threeDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Frittte Rain Coat",
            amount: 400,
            categoryId: catClothings,
            isIncome: false,
            isBigBuck: true,
            transactedAt: threeDaysAgoIso,
            year: threeDaysAgo.year,
            month: threeDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Ham Sandwich",
            amount: 150,
            categoryId: catFood,
            isIncome: false,
            isBigBuck: false,
            transactedAt: threeDaysAgoIso,
            year: threeDaysAgo.year,
            month: threeDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Donation from Joyce",
            amount: 13000,
            categoryId: catIncome,
            isIncome: true,
            isBigBuck: false,
            transactedAt: threeDaysAgoIso,
            year: threeDaysAgo.year,
            month: threeDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });

        // Two days ago
        txStore.put({
            id: generateId(),
            description: "Cheque from Evrart",
            amount: 2500,
            categoryId: catIncome,
            isIncome: true,
            isBigBuck: false,
            transactedAt: twoDaysAgoIso,
            year: twoDaysAgo.year,
            month: twoDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Magnesium",
            amount: 180,
            categoryId: catMedicine,
            isIncome: false,
            isBigBuck: false,
            transactedAt: twoDaysAgoIso,
            year: twoDaysAgo.year,
            month: twoDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Dick Mullen and the Mistaken Identity",
            amount: 800,
            categoryId: catReading,
            isIncome: false,
            isBigBuck: true,
            transactedAt: twoDaysAgoIso,
            year: twoDaysAgo.year,
            month: twoDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Borscht",
            amount: 300,
            categoryId: catFood,
            isIncome: false,
            isBigBuck: false,
            transactedAt: twoDaysAgoIso,
            year: twoDaysAgo.year,
            month: twoDaysAgo.month,
            updatedAt: auditNow,
            deletedAt: null,
        });

        // One day ago
        txStore.put({
            id: generateId(),
            description: "The Greatest Innocence",
            amount: 470,
            categoryId: catReading,
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
            description: "Hypnogamma",
            amount: 500,
            categoryId: catMedicine,
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
            description: "Drouamine",
            amount: 500,
            categoryId: catMedicine,
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
            description: "Harmon Tape Player",
            amount: 1000,
            categoryId: catHardware,
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
            description: "FALN modular track pants",
            amount: 1500,
            categoryId: catClothings,
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
            description: "Salami",
            amount: 100,
            categoryId: catFood,
            isIncome: false,
            isBigBuck: false,
            transactedAt: yesterdayIso,
            year: yesterday.year,
            month: yesterday.month,
            updatedAt: auditNow,
            deletedAt: null,
        });

        // Today
        txStore.put({
            id: generateId(),
            description: "Selling bottles at Frittte",
            amount: 300,
            categoryId: catIncome,
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
            description: "FALN ultra sneakers",
            amount: 5000,
            categoryId: catClothings,
            isIncome: false,
            isBigBuck: true,
            transactedAt: todayIso,
            year: now.year,
            month: now.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Suzerainty board game",
            amount: 1200,
            categoryId: catHardware,
            isIncome: false,
            isBigBuck: true,
            transactedAt: todayIso,
            year: now.year,
            month: now.month,
            updatedAt: auditNow,
            deletedAt: null,
        });
        txStore.put({
            id: generateId(),
            description: "Topping pie",
            amount: 200,
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
            description: "Apartment rent",
            amount: 3000,
            categoryId: catRent,
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
            description: "Apartment rent",
            amount: 3000,
            categoryId: catRent,
            isIncome: false,
            isBigBuck: false,
            frequency: "weekly",
            dayOfWeek: now.weekday - 1,
            dayOfMonth: null,
            monthOfYear: null,
            lastGeneratedAt: auditNow,
            nextGenerationAt: toIsoString(now.plus({ weeks: 1 })),
            isActive: true,
            createdAt: auditNow,
            updatedAt: auditNow,
            deletedAt: null,
        });
    });
}
