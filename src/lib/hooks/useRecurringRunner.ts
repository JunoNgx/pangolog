"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { createBuck } from "../db/bucks";
import { createDime } from "../db/dimes";
import {
    getDueRecurringRules,
    updateRecurringRule,
} from "../db/recurringRules";
import type { RecurringRule } from "../db/types";

function computeNextDate(from: Date, rule: RecurringRule): Date {
    const next = new Date(from);
    switch (rule.frequency) {
        case "daily":
            next.setDate(next.getDate() + 1);
            break;
        case "weekly":
            next.setDate(next.getDate() + 7);
            break;
        case "monthly":
            next.setMonth(next.getMonth() + 1);
            if (rule.dayOfMonth !== null) {
                const lastDay = new Date(
                    next.getFullYear(),
                    next.getMonth() + 1,
                    0,
                ).getDate();
                next.setDate(Math.min(rule.dayOfMonth, lastDay));
            }
            break;
        case "yearly":
            next.setFullYear(next.getFullYear() + 1);
            if (rule.monthOfYear !== null) next.setMonth(rule.monthOfYear - 1);
            if (rule.dayOfMonth !== null) {
                const lastDay = new Date(
                    next.getFullYear(),
                    next.getMonth() + 1,
                    0,
                ).getDate();
                next.setDate(Math.min(rule.dayOfMonth, lastDay));
            }
            break;
    }
    return next;
}

function toNoonLocalISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return new Date(`${y}-${m}-${d}T12:00:00`).toISOString();
}

async function processRule(rule: RecurringRule): Promise<void> {
    const now = new Date();
    let current = new Date(rule.nextGenerationAt);
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
        nextGenerationAt: current.toISOString(),
        lastGeneratedAt: now.toISOString(),
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
