import { describe, expect, it } from "vitest";
import { convertDimeToPangolog, validateDimeCsv } from "./dimeProcess";
import { getCategoryMeta } from "./iconMap";

const NOW = "2026-06-26T12:00:00.000+00:00";

const MINIMAL_CSV = [
    "Date,Note,Amount,Category,Type",
    "2026-06-26 12:00:00 +0000,Lunch,9.90,Food,Expense",
].join("\n");

const MIXED_TYPES_CSV = [
    "Date,Note,Amount,Category,Type",
    "2026-06-26 12:00:00 +0000,Allowance,1.00,Allowance,Income",
    "2026-06-26 11:00:00 +0000,Coffee,3.50,Food,Expense",
    "2026-06-26 10:00:00 +0000,Refund,5.00,Refund,Income",
].join("\n");

const UNKNOWN_CATEGORY_CSV = [
    "Date,Note,Amount,Category,Type",
    "2026-06-26 12:00:00 +0000,Note,1.00,Pet Care,Expense",
].join("\n");

const CR_LF_CSV = [
    "Date,Note,Amount,Category,Type",
    "2026-06-26 12:00:00 +0000,A,1.00,Food,Expense",
    "2026-06-26 11:00:00 +0000,B,2.00,Food,Expense",
].join("\r\n");

const BOM_CSV = `\ufeff${MINIMAL_CSV}`;

describe("validateDimeCsv", () => {
    it("parses a minimal CSV correctly", () => {
        const result = validateDimeCsv(MINIMAL_CSV);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.rows).toEqual([
            {
                date: "2026-06-26 12:00:00 +0000",
                note: "Lunch",
                amount: 9.9,
                category: "Food",
                type: "Expense",
            },
        ]);
    });

    it("parses the mixed-types CSV with Income and Expense rows", () => {
        const result = validateDimeCsv(MIXED_TYPES_CSV);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.rows).toHaveLength(3);
        expect(result.rows[0]?.type).toBe("Income");
        expect(result.rows[1]?.type).toBe("Expense");
        expect(result.rows[2]?.type).toBe("Income");
    });

    it("handles CRLF line endings", () => {
        const result = validateDimeCsv(CR_LF_CSV);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.rows).toHaveLength(2);
    });

    it("strips a leading BOM", () => {
        const result = validateDimeCsv(BOM_CSV);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0]?.note).toBe("Lunch");
    });

    it("rejects an empty file", () => {
        const result = validateDimeCsv("");
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toMatch(/empty/i);
    });

    it("rejects a single line with no data rows", () => {
        const result = validateDimeCsv("Date,Note,Amount,Category,Type");
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.rows).toEqual([]);
    });

    it("rejects wrong headers (column 1 mismatch)", () => {
        const result = validateDimeCsv(
            "Timestamp,Note,Amount,Category,Type\n2026-06-26 12:00:00 +0000,x,1,Food,Expense\n",
        );
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toContain("Header mismatch");
        expect(result.error).toContain("Date");
    });

    it("rejects wrong headers (any column)", () => {
        const result = validateDimeCsv(
            "Date,Note,Amount,Category,TypeX\n2026-06-26 12:00:00 +0000,x,1,Food,Expense\n",
        );
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toContain("Header mismatch");
    });

    it("rejects rows with wrong column count", () => {
        const result = validateDimeCsv(
            "Date,Note,Amount,Category,Type\n2026-06-26 12:00:00 +0000,OnlyFour,1,Food\n",
        );
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error).toContain("columns");
    });
});

describe("convertDimeToPangolog", () => {
    describe("amount conversion", () => {
        async function amountOf(rawAmount: number) {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: rawAmount,
                        category: "",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            return converted.data.transactions?.[0]?.amount;
        }

        it("converts 9.9 to 990", async () => {
            expect(await amountOf(9.9)).toBe(990);
        });

        it("converts 21.75 to 2175", async () => {
            expect(await amountOf(21.75)).toBe(2175);
        });

        it("converts 1 to 100", async () => {
            expect(await amountOf(1)).toBe(100);
        });

        it("rejects a zero amount", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 0,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.skippedCount).toBe(1);
            expect(converted.data.transactions).toEqual([]);
            expect(converted.errors[0]).toMatch(/invalid amount/);
        });

        it("rejects a negative amount", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: -5,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.skippedCount).toBe(1);
            expect(converted.data.transactions).toEqual([]);
        });

        it("rejects a non-numeric amount", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: Number.NaN,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.skippedCount).toBe(1);
            expect(converted.data.transactions).toEqual([]);
        });
    });

    describe("date handling", () => {
        it("parses a Dime-format date with +0000 timezone", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            const tx = converted.data.transactions?.[0];
            expect(tx?.transactedAt).toMatch(/^2026-06-26T12:00:00/);
            expect(tx?.year).toBe(2026);
            expect(tx?.month).toBe(6);
        });

        it("rejects an invalid date string", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "not a date",
                        note: "x",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.skippedCount).toBe(1);
            expect(converted.data.transactions).toEqual([]);
            expect(converted.errors[0]).toMatch(/invalid date/);
        });

        it("rejects an empty date", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "",
                        note: "x",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.skippedCount).toBe(1);
            expect(converted.errors[0]).toMatch(/invalid date/);
        });
    });

    describe("note handling", () => {
        it("accepts an empty note and stores it as an empty description", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.skippedCount).toBe(0);
            expect(converted.errors).toEqual([]);
            expect(converted.data.transactions?.[0]?.description).toBe("");
        });

        it("accepts a whitespace-only note and trims it to an empty description", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "   ",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.skippedCount).toBe(0);
            expect(converted.errors).toEqual([]);
            expect(converted.data.transactions?.[0]?.description).toBe("");
        });

        it("trims the note before storing as description", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "  Coffee  ",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.data.transactions?.[0]?.description).toBe(
                "Coffee",
            );
        });
    });

    describe("type handling", () => {
        async function isIncomeFor(type: string) {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "Food",
                        type,
                    },
                ],
                [],
                NOW,
            );
            return converted.data.transactions?.[0]?.isIncome;
        }

        it("maps 'Income' to isIncome: true", async () => {
            expect(await isIncomeFor("Income")).toBe(true);
        });

        it("maps 'Expense' to isIncome: false", async () => {
            expect(await isIncomeFor("Expense")).toBe(false);
        });

        it("defaults an unknown type to isIncome: false", async () => {
            expect(await isIncomeFor("Bogus")).toBe(false);
            expect(await isIncomeFor("")).toBe(false);
        });
    });

    describe("category handling", () => {
        it("returns null categoryId for an empty category", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.data.transactions?.[0]?.categoryId).toBeNull();
        });

        it("creates a new mapped category when none exists", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            const created = converted.data.categories[0];
            expect(created).toBeDefined();
            expect(created?.name).toBe("Food");
            expect(created?.icon).toBe("🥪");
            expect(created?.colour).toBe("#F97316");
            expect(converted.data.transactions?.[0]?.categoryId).toBe(
                created?.id,
            );
        });

        it("uses fallback meta for an unknown category", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "Pet Care",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            const created = converted.data.categories[0];
            expect(created?.icon).toBe("📦");
            expect(created?.colour).toMatch(/^#[0-9A-F]{6}$/);
        });

        it("reuses an existing category by lower-trim name and preserves customisations", async () => {
            const existing = [
                {
                    id: "existing-id",
                    createdAt: NOW,
                    updatedAt: "2025-01-01T00:00:00.000+00:00",
                    deletedAt: null,
                    name: "Food",
                    colour: "#CUSTOM",
                    icon: "🍕",
                    priority: 42,
                    isBuckOnly: true,
                    isIncomeOnly: false,
                },
            ];
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "FOOD",
                        type: "Expense",
                    },
                ],
                existing,
                NOW,
            );
            expect(converted.data.categories).toEqual([]);
            expect(converted.data.transactions?.[0]?.categoryId).toBe(
                "existing-id",
            );
        });

        it("resolves multiple rows that share the same category name into one single new category", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "a",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                    {
                        date: "2026-06-26 11:00:00 +0000",
                        note: "b",
                        amount: 2,
                        category: "Food",
                        type: "Expense",
                    },
                    {
                        date: "2026-06-26 10:00:00 +0000",
                        note: "c",
                        amount: 3,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.data.categories).toHaveLength(1);
            expect(
                converted.data.transactions?.every(
                    (tx) => tx.categoryId === converted.data.categories[0]?.id,
                ),
            ).toBe(true);
        });

        it("starts new category priority at 0 when no existing categories", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.data.categories[0]?.priority).toBe(0);
        });

        it("starts new category priority after the max existing priority", async () => {
            const existing = [
                {
                    id: "a",
                    createdAt: NOW,
                    updatedAt: NOW,
                    deletedAt: null,
                    name: "A",
                    colour: "#000000",
                    icon: "A",
                    priority: 0,
                    isBuckOnly: false,
                    isIncomeOnly: false,
                },
                {
                    id: "b",
                    createdAt: NOW,
                    updatedAt: NOW,
                    deletedAt: null,
                    name: "B",
                    colour: "#000000",
                    icon: "B",
                    priority: 2,
                    isBuckOnly: false,
                    isIncomeOnly: false,
                },
            ];
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "New",
                        type: "Expense",
                    },
                ],
                existing,
                NOW,
            );
            expect(converted.data.categories[0]?.priority).toBe(3);
        });
    });

    describe("result shape", () => {
        it("sets exportedAt to the now argument", async () => {
            const converted = await convertDimeToPangolog([], [], NOW);
            expect(converted.data.exportedAt).toBe(NOW);
        });

        it("omits recurringRules (Dime does not produce any)", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "x",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            expect(converted.data.recurringRules).toBeUndefined();
        });

        it("returns an empty result for an empty input", async () => {
            const converted = await convertDimeToPangolog([], [], NOW);
            expect(converted.data.transactions).toEqual([]);
            expect(converted.data.categories).toEqual([]);
            expect(converted.skippedCount).toBe(0);
            expect(converted.errors).toEqual([]);
        });

        it("gives every transaction a unique id, isBigBuck: false, and deletedAt: null", async () => {
            const converted = await convertDimeToPangolog(
                [
                    {
                        date: "2026-06-26 12:00:00 +0000",
                        note: "a",
                        amount: 1,
                        category: "Food",
                        type: "Expense",
                    },
                    {
                        date: "2026-06-26 11:00:00 +0000",
                        note: "b",
                        amount: 2,
                        category: "Food",
                        type: "Expense",
                    },
                ],
                [],
                NOW,
            );
            const txs = converted.data.transactions ?? [];
            const ids = new Set(txs.map((tx) => tx.id));
            expect(ids.size).toBe(txs.length);
            for (const tx of txs) {
                expect(tx.isBigBuck).toBe(false);
                expect(tx.deletedAt).toBeNull();
            }
        });
    });
});

describe("getCategoryMeta", () => {
    it("returns mapped meta for Food", () => {
        expect(getCategoryMeta("Food")).toEqual({
            emoji: "🥪",
            colour: "#F97316",
        });
    });

    it("returns mapped meta for Allowance", () => {
        expect(getCategoryMeta("Allowance")).toEqual({
            emoji: "💵",
            colour: "#22C55E",
        });
    });

    it("returns mapped meta for Entertainment", () => {
        expect(getCategoryMeta("Entertainment")).toEqual({
            emoji: "🎬",
            colour: "#EC4899",
        });
    });

    it("returns the fallback box and a 6-digit hex colour for unknown names", () => {
        const meta = getCategoryMeta("Pet Care");
        expect(meta.emoji).toBe("📦");
        expect(meta.colour).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("is deterministic for the same input", () => {
        const a = getCategoryMeta("Pet Care");
        const b = getCategoryMeta("Pet Care");
        expect(a).toEqual(b);
    });

    it("is case-insensitive for unknown names", () => {
        expect(getCategoryMeta("Pet Care")).toEqual(
            getCategoryMeta("pet care"),
        );
    });
});

describe("integration with synthetic CSVs", () => {
    it("round-trips MIXED_TYPES_CSV into 3 new categories and 3 transactions", async () => {
        const parsed = validateDimeCsv(MIXED_TYPES_CSV);
        if (!parsed.ok) throw new Error(parsed.error);
        const converted = await convertDimeToPangolog(parsed.rows, [], NOW);
        expect(converted.data.categories).toHaveLength(3);
        const categoryNames = converted.data.categories
            .map((c) => c.name)
            .sort();
        expect(categoryNames).toEqual(["Allowance", "Food", "Refund"]);
        const txs = converted.data.transactions ?? [];
        expect(txs).toHaveLength(3);
        const incomeTxs = txs.filter((tx) => tx.isIncome);
        const expenseTxs = txs.filter((tx) => !tx.isIncome);
        expect(incomeTxs).toHaveLength(2);
        expect(expenseTxs).toHaveLength(1);
    });

    it("uses the fallback icon and FNV-1a colour for an unknown category", async () => {
        const parsed = validateDimeCsv(UNKNOWN_CATEGORY_CSV);
        if (!parsed.ok) throw new Error(parsed.error);
        const converted = await convertDimeToPangolog(parsed.rows, [], NOW);
        const tx = converted.data.transactions?.[0];
        const created = converted.data.categories[0];
        expect(tx?.categoryId).toBe(created?.id);
        expect(created?.icon).toBe("📦");
        expect(created?.name).toBe("Pet Care");
        expect(created?.colour).toEqual(getCategoryMeta("Pet Care").colour);
    });
});
