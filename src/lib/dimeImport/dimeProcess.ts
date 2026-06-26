import { DateTime } from "luxon";
import { getAllCategories } from "@/lib/db/categories";
import type { Category, Transaction } from "@/lib/db/types";
import { generateId } from "@/lib/db/uuid";
import type { ImportData } from "@/lib/import";
import { getCategoryMeta } from "./iconMap";
import type { DimeRow } from "./types";

const REQUIRED_HEADERS = [
    "Date",
    "Note",
    "Amount",
    "Category",
    "Type",
] as const;
const COLUMN_COUNT = REQUIRED_HEADERS.length;

export type ValidateDimeCsvResult =
    | { ok: true; rows: DimeRow[] }
    | { ok: false; error: string };

export function validateDimeCsv(text: string): ValidateDimeCsvResult {
    const body = text.startsWith("\ufeff") ? text.slice(1) : text;
    const rawLines = body.split(/\r?\n/);
    const lines = rawLines.filter((line) => line.length > 0);

    if (lines.length === 0) {
        return { ok: false, error: "File is empty." };
    }

    const headerLine = lines[0];
    const headers = headerLine.split(",").map((cell) => cell.trim());
    for (let i = 0; i < REQUIRED_HEADERS.length; i += 1) {
        if (headers[i] !== REQUIRED_HEADERS[i]) {
            return {
                ok: false,
                error: `Header mismatch at column ${i + 1}: expected "${REQUIRED_HEADERS[i]}", got "${headers[i] ?? ""}".`,
            };
        }
    }

    const rows: DimeRow[] = [];
    for (let i = 1; i < lines.length; i += 1) {
        const cells = lines[i].split(",");
        if (cells.length !== COLUMN_COUNT) {
            return {
                ok: false,
                error: `Row ${i + 1} has ${cells.length} columns, expected ${COLUMN_COUNT}. Dime exports may have stripped commas in notes; please re-export the file.`,
            };
        }
        const [date, note, amountRaw, category, type] = cells;
        rows.push({
            date: date.trim(),
            note: note.trim(),
            amount: Number(amountRaw.trim()),
            category: category.trim(),
            type: type.trim(),
        });
    }

    return { ok: true, rows };
}

export interface DimeImportResult {
    data: ImportData;
    skippedCount: number;
    errors: string[];
}

function parseDimeAmount(raw: string): number | null {
    const trimmedText = raw.trim();
    if (!trimmedText) return null;
    const cleanedText = trimmedText.replace(/^[$€£¥₹+]+/, "");
    const parsedNumber = Number(cleanedText);
    if (!Number.isFinite(parsedNumber) || parsedNumber <= 0) return null;
    return Math.round(parsedNumber * 100);
}

function parseDimeDate(raw: string): DateTime | null {
    const trimmedText = raw.trim();
    if (!trimmedText) return null;

    const firstParse = DateTime.fromISO(trimmedText, { setZone: true });
    if (firstParse.isValid) return firstParse;

    const match = trimmedText.match(/^(\S+)\s+(\S+)\s+(\S+)$/);
    if (!match) return null;
    const iso = `${match[1]}T${match[2]}${match[3]}`;
    const dt = DateTime.fromISO(iso, { setZone: true });
    return dt.isValid ? dt : null;
}

export async function convertDimeToPangolog(
    rows: DimeRow[],
    existingCategories: Category[],
    now: string,
): Promise<DimeImportResult> {
    const nameIndex = new Map(
        existingCategories.map((c) => [c.name.trim().toLowerCase(), c]),
    );

    const basePriority =
        existingCategories.length > 0
            ? Math.max(...existingCategories.map((c) => c.priority)) + 1
            : 0;

    const newCategories: Category[] = [];
    const errors: string[] = [];
    const transactions: Transaction[] = [];
    const resolvedNames = new Map<string, Category>();
    let nextInsertionIndex = 0;
    let skippedCount = 0;

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const rowNumber = i + 2;

        const dt = parseDimeDate(row.date);
        if (!dt) {
            skippedCount += 1;
            errors.push(
                `Row ${rowNumber} skipped: invalid date "${row.date}".`,
            );
            continue;
        }

        const trimmedNote = row.note.trim();
        if (!trimmedNote) {
            skippedCount += 1;
            errors.push(`Row ${rowNumber} skipped: empty note.`);
            continue;
        }

        const amount = parseDimeAmount(String(row.amount));
        if (amount === null) {
            skippedCount += 1;
            errors.push(
                `Row ${rowNumber} skipped: invalid amount "${row.amount}".`,
            );
            continue;
        }

        let categoryId: string | null = null;
        if (row.category) {
            const key = row.category.toLowerCase();
            let matchedCategory = resolvedNames.get(key);
            if (!matchedCategory) {
                const existingCategory = nameIndex.get(key);
                if (existingCategory) {
                    matchedCategory = { ...existingCategory, updatedAt: now };
                } else {
                    const meta = getCategoryMeta(row.category);
                    matchedCategory = {
                        id: generateId(),
                        createdAt: now,
                        updatedAt: now,
                        deletedAt: null,
                        name: row.category,
                        colour: meta.colour,
                        icon: meta.emoji,
                        priority: basePriority + nextInsertionIndex,
                        isBuckOnly: false,
                        isIncomeOnly: false,
                    };
                    newCategories.push(matchedCategory);
                    nextInsertionIndex += 1;
                }
                resolvedNames.set(key, matchedCategory);
            }
            categoryId = matchedCategory.id;
        }

        const isoResult = dt.toISO();
        if (!isoResult) {
            skippedCount += 1;
            errors.push(
                `Row ${rowNumber} skipped: failed to serialise date "${row.date}".`,
            );
            continue;
        }

        transactions.push({
            id: generateId(),
            transactedAt: isoResult,
            updatedAt: now,
            deletedAt: null,
            categoryId,
            amount,
            year: dt.year,
            month: dt.month,
            description: trimmedNote,
            isIncome: row.type === "Income",
            isBigBuck: false,
        });
    }

    return {
        data: {
            exportedAt: now,
            transactions,
            categories: newCategories,
        },
        skippedCount,
        errors,
    };
}

export async function getDimeExistingCategories(): Promise<Category[]> {
    return getAllCategories();
}
