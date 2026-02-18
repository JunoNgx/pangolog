import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { getDb } from "./connection";
import type { Buck, Category, Dime } from "./types";

export async function purgeSeedData(): Promise<void> {
    const { seedIds, setSeedIds } = useLocalSettingsStore.getState();
    if (!seedIds) return;

    const db = await getDb();

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(["categories", "dimes", "bucks"], "readwrite");
        for (const id of seedIds.categoryIds) tx.objectStore("categories").delete(id);
        for (const id of seedIds.dimeIds) tx.objectStore("dimes").delete(id);
        for (const id of seedIds.buckIds) tx.objectStore("bucks").delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    setSeedIds(null);
}

export async function seedData(): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    const date = new Date(now);

    const foodId = crypto.randomUUID();
    const groceryId = crypto.randomUUID();
    const videogameId = crypto.randomUUID();
    const eggsId = crypto.randomUUID();
    const sandwichId = crypto.randomUUID();
    const gameId = crypto.randomUUID();

    const categories: Category[] = [
        {
            id: foodId,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            name: "Food",
            colour: "#f97316",
            icon: "🍔",
            priority: 0,
            isBuckOnly: false,
            isIncomeOnly: false,
        },
        {
            id: groceryId,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            name: "Grocery",
            colour: "#22c55e",
            icon: "🛒",
            priority: 1,
            isBuckOnly: false,
            isIncomeOnly: false,
        },
        {
            id: videogameId,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            name: "Videogame",
            colour: "#8b5cf6",
            icon: "🎮",
            priority: 2,
            isBuckOnly: true,
            isIncomeOnly: false,
        },
    ];

    const dimes: Dime[] = [
        {
            id: eggsId,
            transactedAt: now,
            updatedAt: now,
            deletedAt: null,
            categoryId: groceryId,
            amount: 500,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            description: "Eggs",
            isIncome: false,
        },
        {
            id: sandwichId,
            transactedAt: now,
            updatedAt: now,
            deletedAt: null,
            categoryId: foodId,
            amount: 1000,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            description: "Sandwich",
            isIncome: false,
        },
    ];

    const bucks: Buck[] = [
        {
            id: gameId,
            transactedAt: now,
            updatedAt: now,
            deletedAt: null,
            categoryId: videogameId,
            amount: 2000,
            year: date.getFullYear(),
            description: "What Remains of Edith Finch",
            isIncome: false,
        },
    ];

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        for (const cat of categories) store.add(cat);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("dimes", "readwrite");
        const store = tx.objectStore("dimes");
        for (const dime of dimes) store.add(dime);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("bucks", "readwrite");
        const store = tx.objectStore("bucks");
        for (const buck of bucks) store.add(buck);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    useLocalSettingsStore.getState().setSeedIds({
        categoryIds: [foodId, groceryId, videogameId],
        dimeIds: [eggsId, sandwichId],
        buckIds: [gameId],
    });
}
