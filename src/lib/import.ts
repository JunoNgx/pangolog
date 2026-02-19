import {
    bulkPutBucks,
    bulkPutCategories,
    bulkPutDimes,
    getAllBucksForSync,
    getAllCategoriesForSync,
    getAllDimesForSync,
} from "./db/sync";
import type { Buck, Category, Dime } from "./db/types";

export interface ImportData {
    exportedAt: string;
    dimes: Dime[];
    bucks: Buck[];
    categories: Category[];
}

export interface ImportPreview {
    dimesAdded: number;
    dimesUpdated: number;
    bucksAdded: number;
    bucksUpdated: number;
    categoriesAdded: number;
    categoriesUpdated: number;
    errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasRequiredFields(
    item: unknown,
): item is { id: string; updatedAt: string } {
    if (!isRecord(item)) return false;
    return typeof item.id === "string" && typeof item.updatedAt === "string";
}

export function validateImportData(data: unknown): data is ImportData {
    if (!isRecord(data)) return false;
    if (!Array.isArray(data.dimes)) return false;
    if (!Array.isArray(data.bucks)) return false;
    if (!Array.isArray(data.categories)) return false;
    if (!data.dimes.every(hasRequiredFields)) return false;
    if (!data.bucks.every(hasRequiredFields)) return false;
    if (!data.categories.every(hasRequiredFields)) return false;
    return true;
}

export async function previewImport(data: ImportData): Promise<ImportPreview> {
    const [existingDimes, existingBucks, existingCategories] =
        await Promise.all([
            getAllDimesForSync(),
            getAllBucksForSync(),
            getAllCategoriesForSync(),
        ]);

    const dimeMap = new Map(existingDimes.map((d) => [d.id, d]));
    const buckMap = new Map(existingBucks.map((b) => [b.id, b]));
    const categoryMap = new Map(existingCategories.map((c) => [c.id, c]));

    let dimesAdded = 0;
    let dimesUpdated = 0;
    for (const dime of data.dimes) {
        const existing = dimeMap.get(dime.id);
        if (!existing) {
            dimesAdded++;
        } else if (dime.updatedAt > existing.updatedAt) {
            dimesUpdated++;
        }
    }

    let bucksAdded = 0;
    let bucksUpdated = 0;
    for (const buck of data.bucks) {
        const existing = buckMap.get(buck.id);
        if (!existing) {
            bucksAdded++;
        } else if (buck.updatedAt > existing.updatedAt) {
            bucksUpdated++;
        }
    }

    let categoriesAdded = 0;
    let categoriesUpdated = 0;
    for (const cat of data.categories) {
        const existing = categoryMap.get(cat.id);
        if (!existing) {
            categoriesAdded++;
        } else if (cat.updatedAt > existing.updatedAt) {
            categoriesUpdated++;
        }
    }

    return {
        dimesAdded,
        dimesUpdated,
        bucksAdded,
        bucksUpdated,
        categoriesAdded,
        categoriesUpdated,
        errors: [],
    };
}

export async function executeImport(data: ImportData): Promise<ImportPreview> {
    const preview = await previewImport(data);

    const [existingDimes, existingBucks, existingCategories] =
        await Promise.all([
            getAllDimesForSync(),
            getAllBucksForSync(),
            getAllCategoriesForSync(),
        ]);

    const dimeMap = new Map(existingDimes.map((d) => [d.id, d]));
    const buckMap = new Map(existingBucks.map((b) => [b.id, b]));
    const categoryMap = new Map(existingCategories.map((c) => [c.id, c]));

    const dimesToPut = data.dimes.filter((d) => {
        const existing = dimeMap.get(d.id);
        return !existing || d.updatedAt > existing.updatedAt;
    });

    const bucksToPut = data.bucks.filter((b) => {
        const existing = buckMap.get(b.id);
        return !existing || b.updatedAt > existing.updatedAt;
    });

    const categoriesToPut = data.categories.filter((c) => {
        const existing = categoryMap.get(c.id);
        return !existing || c.updatedAt > existing.updatedAt;
    });

    await Promise.all([
        bulkPutDimes(dimesToPut),
        bulkPutBucks(bucksToPut),
        bulkPutCategories(categoriesToPut),
    ]);

    return preview;
}
