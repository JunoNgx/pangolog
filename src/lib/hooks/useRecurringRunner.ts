"use client";

import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useCallback, useEffect } from "react";
import {
    advanceRecurringRule,
    getDueRecurringRules,
} from "../db/recurringRules";
import { createTransaction } from "../db/transactions";
import type { RecurringRule } from "../db/types";
import { toIsoDateString, toIsoString, utcNowString } from "../utils";
import { useLogger } from "./useLogger";

// Module-level guard prevents concurrent runs across hook instances.
let isRunnerRunning = false;

export function computeNextDate(from: DateTime, rule: RecurringRule): DateTime {
    switch (rule.frequency) {
        case "daily":
            return from.plus({ days: 1 });
        case "weekly":
            return from.plus({ weeks: 1 });
        case "monthly": {
            let next = from.plus({ months: 1 });
            if (rule.dayOfMonth !== null) {
                next = next.set({
                    day: Math.min(rule.dayOfMonth, next.daysInMonth ?? 31),
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
                    day: Math.min(rule.dayOfMonth, next.daysInMonth ?? 31),
                });
            }
            return next;
        }
    }
}

function computeRulePeriod(date: DateTime, rule: RecurringRule): string {
    switch (rule.frequency) {
        case "daily":
        case "weekly":
            return toIsoDateString(date);
        case "monthly":
            return date.toFormat("yyyy-MM");
        case "yearly":
            return date.toFormat("yyyy");
    }
}

export async function processRule(
    rule: RecurringRule,
    // TODO: remove after resolving double-trigger bug
    addLoggerEntry?: (message: string, logcode: string, data?: unknown) => void,
): Promise<void> {
    const logger = addLoggerEntry ?? (() => {});
    const now = DateTime.now();
    let nextScheduledDate = DateTime.fromISO(rule.nextGenerationAt);
    let scheduledDate = nextScheduledDate;

    while (nextScheduledDate <= now) {
        scheduledDate = nextScheduledDate;
        nextScheduledDate = computeNextDate(nextScheduledDate, rule).set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
        });
    }

    // TODO: remove after resolving double-trigger bug
    logger("Creating transaction for rule", "RULE_TX", {
        ruleId: rule.id,
        rulePeriod: computeRulePeriod(scheduledDate, rule),
    });

    await createTransaction({
        transactedAt: toIsoString(
            scheduledDate.set({
                hour: now.hour,
                minute: now.minute,
                second: now.second,
                millisecond: now.millisecond,
            }),
        ),
        amount: rule.amount,
        isIncome: rule.isIncome,
        isBigBuck: rule.isBigBuck,
        categoryId: rule.categoryId,
        description: rule.description,
        ruleId: rule.id,
        rulePeriod: computeRulePeriod(scheduledDate, rule),
    });

    await advanceRecurringRule(
        rule.id,
        toIsoString(nextScheduledDate),
        utcNowString(),
    );

    // TODO: remove after resolving double-trigger bug
    logger("Rule advanced", "RULE_ADVANCED", {
        ruleId: rule.id,
        newNextGenerationAt: toIsoString(nextScheduledDate),
    });
}

export async function runRecurringRunner(
    queryClient: QueryClient,
    addLoggerEntry: (message: string, logcode: string, data?: unknown) => void,
    trigger: string,
): Promise<void> {
    // TODO: remove after resolving double-trigger bug
    if (isRunnerRunning) {
        addLoggerEntry("Recurring runner skipped", "RUNNER_SKIP", {
            trigger,
            isRunnerRunning,
        });
        return;
    }
    addLoggerEntry("Recurring runner started", "RUNNER_START", {
        trigger,
        isRunnerRunning,
    });
    isRunnerRunning = true;

    try {
        const dueRules = await getDueRecurringRules();
        addLoggerEntry("Due rules fetched", "RUNNER_DUE", {
            trigger,
            count: dueRules.length,
            ruleIds: dueRules.map((r) => r.id),
        });
        if (dueRules.length === 0) return;

        await Promise.allSettled(
            dueRules.map((rule) => processRule(rule, addLoggerEntry)),
        );
        await queryClient.invalidateQueries();
    } finally {
        isRunnerRunning = false;
    }
}

export function useRecurringRunner() {
    const queryClient = useQueryClient();
    const { addLoggerEntry } = useLogger();

    const run = useCallback(
        (trigger: string) =>
            runRecurringRunner(queryClient, addLoggerEntry, trigger),
        [queryClient, addLoggerEntry],
    );

    useEffect(() => {
        run("mount");
    }, [run]);

    useEffect(() => {
        function handleVisibilityChange() {
            if (document.visibilityState !== "visible") return;
            run("visibilitychange");
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
    }, [run]);
}
