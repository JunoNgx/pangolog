"use client";

import { Skeleton } from "@heroui/react";
import { useState } from "react";
import type { Category, RecurringRule } from "@/lib/db/types";
import { formatAmount } from "@/lib/utils";
import { RecurringRuleDialog } from "./RecurringRuleDialog";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function formatFrequency(rule: RecurringRule): string {
    switch (rule.frequency) {
        case "daily":
            return "Daily";
        case "weekly":
            return rule.dayOfWeek !== null
                ? `Weekly (${DAY_NAMES[rule.dayOfWeek]})`
                : "Weekly";
        case "monthly":
            return rule.dayOfMonth !== null
                ? `Monthly (${rule.dayOfMonth})`
                : "Monthly";
        case "yearly": {
            const month =
                rule.monthOfYear !== null
                    ? MONTH_NAMES[rule.monthOfYear - 1]
                    : "";
            const day = rule.dayOfMonth !== null ? rule.dayOfMonth : "";
            return month && day ? `Yearly (${month} ${day})` : "Yearly";
        }
    }
}

interface RecurringListProps {
    rules: RecurringRule[];
    categories: Category[];
    isLoading: boolean;
}

export function RecurringList({
    rules,
    categories,
    isLoading,
}: RecurringListProps) {
    const [editingRule, setEditingRule] = useState<RecurringRule | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    function handleEdit(rule: RecurringRule) {
        setEditingRule(rule);
        setIsDialogOpen(true);
    }

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingRule(undefined);
    }

    if (isLoading) {
        return (
            <ul className="MainListContainer gap-2">
                {["s1", "s2", "s3"].map((key) => (
                    <Skeleton key={key} className="h-16 w-full rounded-lg" />
                ))}
            </ul>
        );
    }

    if (!rules.length) {
        return (
            <>
                <p className="text-center text-default-400 py-12">
                    No recurring rules yet. Tap + to create one.
                </p>
                <RecurringRuleDialog
                    isOpen={isDialogOpen}
                    onClose={handleCloseDialog}
                    rule={editingRule}
                />
            </>
        );
    }

    return (
        <>
            <ul className="MainListContainer gap-2">
                {rules.map((rule) => (
                    <RecurringItem
                        key={rule.id}
                        rule={rule}
                        category={
                            rule.categoryId
                                ? categoryMap.get(rule.categoryId)
                                : undefined
                        }
                        onEdit={handleEdit}
                    />
                ))}
            </ul>
            <RecurringRuleDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                rule={editingRule}
            />
        </>
    );
}

interface RecurringItemProps {
    rule: RecurringRule;
    category: Category | undefined;
    onEdit: (rule: RecurringRule) => void;
}

function RecurringItem({ rule, category, onEdit }: RecurringItemProps) {
    const hasIndicator = rule.isBigBuck || !rule.isActive;

    return (
        <li
            onClick={() => onEdit(rule)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onEdit(rule);
            }}
            className={`
                rounded-lg px-4 py-3
                flex items-center gap-3
                bg-background
                border border-default-200
                cursor-pointer hover:bg-default-50
                ${!rule.isActive ? "opacity-50" : ""}
            `}
        >
            <div
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: category?.colour }}
            />

            <div className="flex-1 min-w-0">
                <p>
                    <span className="mr-1">{category?.icon ?? "·"}</span>
                    <span className="text-default-700">
                        {category?.name ?? "(no category)"}
                    </span>
                </p>
                {rule.description && (
                    <p
                        className={`
                            font-mono text-sm text-default-400 truncate
                            ${!hasIndicator ? "mt-1" : ""}
                        `}
                    >
                        {rule.description}
                    </p>
                )}
                {hasIndicator && (
                    <div className="flex gap-4 mt-1">
                        {rule.isBigBuck && (
                            <span className="ChipLabel mx-0 text-amber-500">
                                BUCK
                            </span>
                        )}
                        {!rule.isActive && (
                            <span className="ChipLabel mx-0 text-default-400">
                                PAUSED
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                    className={`
                        font-mono font-medium text-sm
                        ${rule.isIncome ? "text-success" : ""}
                    `}
                >
                    {rule.isIncome ? "+" : ""}
                    {formatAmount(rule.amount)}
                </span>
                <span className="text-xs text-default-400 font-mono">
                    {formatFrequency(rule)}
                </span>
                <span className="text-xs text-default-400 font-mono">
                    Next:{" "}
                    {new Date(rule.nextGenerationAt).toLocaleDateString(
                        "en-us",
                        { day: "numeric", month: "short", year: "numeric" },
                    )}
                </span>
            </div>
        </li>
    );
}
