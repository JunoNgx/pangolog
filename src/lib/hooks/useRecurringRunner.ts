"use client";

import { useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useCallback, useEffect, useRef } from "react";
import {
    getDueRecurringRules,
    updateRecurringRule,
} from "../db/recurringRules";
import { createTransaction } from "../db/transactions";
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

async function processRule(rule: RecurringRule): Promise<void> {
    const now = DateTime.now();
    let current = DateTime.fromISO(rule.nextGenerationAt);
    let previous = current;

    while (current <= now) {
        previous = current;
        current = computeNextDate(current, rule);
    }

    await createTransaction({
        transactedAt: previous
            .set({
                hour: now.hour,
                minute: now.minute,
                second: now.second,
                millisecond: now.millisecond,
            })
            .toISO()!,
        amount: rule.amount,
        isIncome: rule.isIncome,
        isBigBuck: rule.isBigBuck,
        categoryId: rule.categoryId,
        description: rule.description,
    });

    await updateRecurringRule(rule.id, {
        nextGenerationAt: current
            .set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
            })
            .toISO()!,
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
