import { DateTime, Settings } from "luxon";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isOnOrBeforeToday } from "./utils";

const originalDefaultZone = Settings.defaultZone;

describe("isOnOrBeforeToday", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Simulate a UTC+8 environment so DateTime.now() returns +08:00 times
        Settings.defaultZone = "Asia/Singapore";
        vi.setSystemTime(new Date("2026-07-27T13:40:00.000+08:00"));
    });

    afterEach(() => {
        vi.useRealTimers();
        Settings.defaultZone = originalDefaultZone;
    });

    it("returns false for local midnight tomorrow", () => {
        // Regression: converting to UTC shifted this back to "today"
        // (2026-07-28T00:00:00+08:00 is 2026-07-27T16:00:00Z), which made
        // future rules appear due.
        const scheduledDate = DateTime.fromISO("2026-07-28T00:00:00.000+08:00");

        expect(isOnOrBeforeToday(scheduledDate)).toBe(false);
    });

    it("returns true for local midnight today", () => {
        const scheduledDate = DateTime.fromISO("2026-07-27T00:00:00.000+08:00");

        expect(isOnOrBeforeToday(scheduledDate)).toBe(true);
    });

    it("returns true for a past local date", () => {
        const scheduledDate = DateTime.fromISO("2026-07-26T00:00:00.000+08:00");

        expect(isOnOrBeforeToday(scheduledDate)).toBe(true);
    });
});
