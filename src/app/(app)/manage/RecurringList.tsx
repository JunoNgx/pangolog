"use client";

import { DateTime } from "luxon";
import { useState } from "react";
import { ChipLabel } from "@/components/ChipLabel";
import { MainListContainer } from "@/components/MainListContainer";
import { DAY_NAMES_ABB, MONTH_NAMES } from "@/lib/constants";
import type { Category, RecurringRule } from "@/lib/db/types";
import { formatAmount } from "@/lib/utils";
import { RecurringRuleDialog } from "./RecurringRuleDialog";

function formatFrequency(rule: RecurringRule): string {
    switch (rule.frequency) {
        case "daily":
            return "Daily";
        case "weekly":
            return rule.dayOfWeek !== null
                ? `Weekly (${DAY_NAMES_ABB[rule.dayOfWeek]})`
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

    if (!rules || !rules.length) {
        return (
            <>
                <p className="text-muted py-12 text-center">
                    Nothing to show.
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
            <MainListContainer className="gap-2">
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
            </MainListContainer>
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
        <li>
            <button
                type="button"
                onClick={() => onEdit(rule)}
                className={`bg-background border-default-200 hover:border-default-400 focus-visible:ring-primary flex w-full cursor-pointer items-center gap-3 rounded-none border-b-1 border-l-4 px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 ${!rule.isActive ? "opacity-50" : ""} `}
                style={{ borderLeftColor: category?.colour }}
            >
                <div className="min-w-0 flex-1">
                    <p>
                        <span className="mr-1">{category?.icon ?? "·"}</span>
                        <span className="text-default-700">
                            {category?.name ?? "(no category)"}
                        </span>
                    </p>
                    {rule.description && (
                        <p
                            className={`text-muted truncate font-mono text-sm ${!hasIndicator ? "mt-1" : ""} `}
                        >
                            {rule.description}
                        </p>
                    )}
                    {hasIndicator && (
                        <div className="mt-1 flex gap-4">
                            {rule.isBigBuck && (
                                <ChipLabel className="mx-0 text-amber-500">
                                    BUCK
                                </ChipLabel>
                            )}
                            {!rule.isActive && (
                                <ChipLabel className="text-muted mx-0">
                                    PAUSED
                                </ChipLabel>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                        className={`font-mono text-sm font-medium ${rule.isIncome ? "text-success" : ""} `}
                    >
                        {rule.isIncome ? "+" : ""}
                        {formatAmount(rule.amount)}
                    </span>
                    <span className="text-muted font-mono text-xs">
                        {formatFrequency(rule)}
                    </span>
                    <span className="text-muted font-mono text-xs">
                        Next:{" "}
                        {DateTime.fromISO(rule.nextGenerationAt).toLocaleString(
                            DateTime.DATE_MED,
                        )}
                    </span>
                </div>
            </button>
        </li>
    );
}
