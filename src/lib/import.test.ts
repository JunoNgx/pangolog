import { describe, expect, it } from "vitest";
import { validateImportData } from "./import";

describe("validateImportData", () => {
    it("returns null for valid complete data", () => {
        const data = {
            categories: [
                {
                    id: "cat-1",
                    updatedAt: "2024-01-01T00:00:00Z",
                    name: "Food",
                },
            ],
            transactions: [
                {
                    id: "tx-1",
                    updatedAt: "2024-01-01T00:00:00Z",
                    amount: 100,
                    transactedAt: "2024-01-01T00:00:00Z",
                    isBigBuck: false,
                },
            ],
            recurringRules: [
                {
                    id: "rule-1",
                    updatedAt: "2024-01-01T00:00:00Z",
                    amount: 100,
                    frequency: "monthly",
                },
            ],
        };

        expect(validateImportData(data)).toBeNull();
    });

    it("returns error when data is not an object", () => {
        expect(validateImportData("string")).toContain(
            "not a valid JSON object",
        );
    });

    it("returns error when categories array is missing", () => {
        expect(validateImportData({})).toContain("categories");
    });

    it("returns error when a category is missing required fields", () => {
        const data = {
            categories: [{ name: "Food" }],
        };

        expect(validateImportData(data)).toContain("missing required fields");
    });

    it("returns error with debug info for duplicate category IDs", () => {
        const data = {
            categories: [
                { id: "dup", updatedAt: "2024-01-01T00:00:00Z", name: "Food" },
                { id: "dup", updatedAt: "2024-02-01T00:00:00Z", name: "Drink" },
            ],
        };

        const error = validateImportData(data);
        expect(error).toContain("Duplicate ID");
        expect(error).toContain("categories");
        expect(error).toContain("Food");
        expect(error).toContain("Drink");
    });

    it("returns error when a transaction is missing required fields", () => {
        const data = {
            categories: [
                {
                    id: "cat-1",
                    updatedAt: "2024-01-01T00:00:00Z",
                    name: "Food",
                },
            ],
            transactions: [{ amount: 100 }],
        };

        expect(validateImportData(data)).toContain("missing required fields");
    });

    it("returns error with debug info for duplicate transaction IDs", () => {
        const data = {
            categories: [
                {
                    id: "cat-1",
                    updatedAt: "2024-01-01T00:00:00Z",
                    name: "Food",
                },
            ],
            transactions: [
                {
                    id: "dup",
                    updatedAt: "2024-01-01T00:00:00Z",
                    amount: 100,
                    transactedAt: "2024-01-01T00:00:00Z",
                    isBigBuck: false,
                    description: "Lunch",
                },
                {
                    id: "dup",
                    updatedAt: "2024-02-01T00:00:00Z",
                    amount: 200,
                    transactedAt: "2024-02-01T00:00:00Z",
                    isBigBuck: false,
                    description: "Dinner",
                },
            ],
        };

        const error = validateImportData(data);
        expect(error).toContain("Duplicate ID");
        expect(error).toContain("transactions");
        expect(error).toContain("Lunch");
        expect(error).toContain("Dinner");
    });

    it("returns null for valid data with only categories", () => {
        const data = {
            categories: [
                {
                    id: "cat-1",
                    updatedAt: "2024-01-01T00:00:00Z",
                    name: "Food",
                },
            ],
        };

        expect(validateImportData(data)).toBeNull();
    });
});
