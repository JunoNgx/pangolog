"use client";

import { useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useCallback, useEffect, useRef } from "react";
import { createBuck } from "../db/bucks";
import { createDime } from "../db/dimes";
import {
    getDueRecurringRules,
    updateRecurringRule,
} from "../db/recurringRules";
import type { RecurringRule } from "../db/types";

// daysInMonth is typed number | undefined for invalid DateTimes, but next is
// always valid here (produced by .plus()), so ! is safe.
function computeNextDate(from: DateTime, rule: RecurringRule): DateTime {
    switch (rule.frequency) {
        case "daily":
            return from.plus({ days: 1 });
        case "weekly":
            return from.plus({ weeks: 1 });
        case "monthly": {
            let next = from.plus({ months: 1 });
            if (rule.dayOfMonth !== null) {
                next = next.set({
                    day: Math.min(rule.dayOfMonth, next.daysInMonth!),
                });
            }
            return next;
        }
        case "yearly": {
            let next = from.plus({ years: 1 });
            if (rule.monthOfYear !== null) {
                next = next.set({ month: rule.monthOfYear });
            }
            if (rule.dayOfMonth !== null) {
                next = next.set({
                    day: Math.min(rule.dayOfMonth, next.daysInMonth!),
                });
            }
            return next;
        }
    }
}

function toNoonLocalISO(dt: DateTime): string {
    return dt.set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toISO()!;
}

function toLocalDateString(dt: DateTime): string {
    return dt.toISODate()!;
}

function parseGenerationDate(dateStr: string): DateTime {
    return DateTime.fromISO(dateStr);
}

async function processRule(rule: RecurringRule): Promise<void> {
    const now = DateTime.now();
    let current = parseGenerationDate(rule.nextGenerationAt);
    let previous = current;

    while (current <= now) {
        previous = current;
        current = computeNextDate(current, rule);
    }

    const transactionInput = {
        transactedAt: toNoonLocalISO(previous),
        amount: rule.amount,
        isIncome: rule.isIncome,
        categoryId: rule.categoryId,
        description: rule.description,
    };

    if (rule.isBigBuck) {
        await createBuck(transactionInput);
    } else {
        await createDime(transactionInput);
    }

    await updateRecurringRule(rule.id, {
        nextGenerationAt: toLocalDateString(current),
        lastGeneratedAt: now.toUTC().toISO()!,
    });
}

export function useRecurringRunner() {
    const queryClient = useQueryClient();
    const isRunningRef = useRef(false);

    const run = useCallback(async () => {
        if (isRunningRef.current) return;
        isRunningRef.current = true;

        try {
            const dueRules = await getDueRecurringRules();
            if (dueRules.length === 0) return;

            await Promise.allSettled(dueRules.map(processRule));
            await queryClient.invalidateQueries();
        } finally {
            isRunningRef.current = false;
        }
    }, [queryClient]);

    useEffect(() => {
        run();
    }, [run]);

    useEffect(() => {
        function handleVisibilityChange() {
            if (document.visibilityState !== "visible") return;
            run();
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
    }, [run]);
}
