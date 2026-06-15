import { DateTime } from "luxon";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RecurringRule } from "../db/types";
import { computeNextDate, processRule } from "./useRecurringRunner";

vi.mock("../db/transactions", () => ({
    createTransaction: vi.fn(),
}));

vi.mock("../db/recurringRules", () => ({
    advanceRecurringRule: vi.fn(),
}));

vi.mock("../utils", async () => {
    const actual = await vi.importActual<typeof import("../utils")>("../utils");
    return {
        ...actual,
        utcNowString: vi.fn(() => DateTime.now().toUTC().toISO()),
    };
});

import { advanceRecurringRule } from "../db/recurringRules";
import { createTransaction } from "../db/transactions";

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

describe("processRule", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("creates only one transaction when multiple periods are missed", async () => {
        vi.setSystemTime(new Date("2024-04-15T12:00:00Z"));

        const rule = buildRule("monthly", {
            dayOfMonth: 15,
            nextGenerationAt: "2024-01-15T00:00:00+00:00",
        });

        await processRule(rule);

        expect(createTransaction).toHaveBeenCalledTimes(1);
        expect(createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                ruleId: "rule-1",
                rulePeriod: "2024-04",
            }),
        );
        expect(advanceRecurringRule).toHaveBeenCalledWith(
            "rule-1",
            expect.stringContaining("2024-05-15"),
            expect.stringContaining("2024-04-15T12:00:00"),
        );
    });

    it("creates one transaction and advances by one period when a single period is missed", async () => {
        vi.setSystemTime(new Date("2024-02-15T12:00:00Z"));

        const rule = buildRule("monthly", {
            dayOfMonth: 15,
            nextGenerationAt: "2024-01-15T00:00:00+00:00",
        });

        await processRule(rule);

        expect(createTransaction).toHaveBeenCalledTimes(1);
        expect(createTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                ruleId: "rule-1",
                rulePeriod: "2024-02",
            }),
        );
        expect(advanceRecurringRule).toHaveBeenCalledWith(
            "rule-1",
            expect.stringContaining("2024-03-15"),
            expect.stringContaining("2024-02-15T12:00:00"),
        );
    });
});
