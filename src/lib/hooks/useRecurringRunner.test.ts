import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import type { RecurringRule } from "../db/types";
import { computeNextDate } from "./useRecurringRunner";

function buildRule(
    frequency: RecurringRule["frequency"],
    overrides: Partial<RecurringRule> = {},
): RecurringRule {
    return {
        id: "rule-1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        deletedAt: null,
        categoryId: null,
        amount: 100,
        description: "Test",
        isIncome: false,
        isBigBuck: false,
        frequency,
        dayOfWeek: null,
        dayOfMonth: null,
        monthOfYear: null,
        lastGeneratedAt: null,
        nextGenerationAt: "2024-01-01T00:00:00Z",
        isActive: true,
        ...overrides,
    };
}

describe("computeNextDate", () => {
    it("advances daily by one day", () => {
        const from = DateTime.fromISO("2024-01-15T00:00:00Z");
        const rule = buildRule("daily");

        const result = computeNextDate(from, rule);

        expect(result.toISODate()).toBe("2024-01-16");
    });

    it("advances weekly by seven days", () => {
        const from = DateTime.fromISO("2024-01-15T00:00:00Z");
        const rule = buildRule("weekly");

        const result = computeNextDate(from, rule);

        expect(result.toISODate()).toBe("2024-01-22");
    });

    it("clamps day to month end when dayOfMonth exceeds days in month", () => {
        const from = DateTime.fromISO("2024-03-15T00:00:00Z");
        const rule = buildRule("monthly", { dayOfMonth: 31 });

        const result = computeNextDate(from, rule);

        expect(result.toISODate()).toBe("2024-04-30");
    });

    it("handles leap year February for dayOfMonth 29", () => {
        const from = DateTime.fromISO("2024-01-31T00:00:00Z");
        const rule = buildRule("monthly", { dayOfMonth: 29 });

        const result = computeNextDate(from, rule);

        expect(result.toISODate()).toBe("2024-02-29");
    });

    it("clamps day when month has fewer days than dayOfMonth", () => {
        const from = DateTime.fromISO("2023-01-31T00:00:00Z");
        const rule = buildRule("monthly", { dayOfMonth: 31 });

        const result = computeNextDate(from, rule);

        expect(result.toISODate()).toBe("2023-02-28");
    });

    it("advances yearly by one year and applies month and day overrides", () => {
        const from = DateTime.fromISO("2024-06-15T00:00:00Z");
        const rule = buildRule("yearly", {
            monthOfYear: 2,
            dayOfMonth: 28,
        });

        const result = computeNextDate(from, rule);

        expect(result.toISODate()).toBe("2025-02-28");
    });

    it("advances yearly by one year with no overrides", () => {
        const from = DateTime.fromISO("2024-06-15T00:00:00Z");
        const rule = buildRule("yearly");

        const result = computeNextDate(from, rule);

        expect(result.toISODate()).toBe("2025-06-15");
    });
});
