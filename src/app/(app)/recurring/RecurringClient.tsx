"use client";

import { Button, Checkbox, Tooltip } from "@heroui/react";
import { ArrowDownAZ, ArrowUpAZ, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useRecurringRules } from "@/lib/hooks/useRecurringRules";
import { SELECT_CLASSES } from "@/lib/utils";
import { RecurringList } from "./RecurringList";
import { RecurringRuleDialog } from "./RecurringRuleDialog";

type SortBy =
    | "createdAt"
    | "amount"
    | "nextGenerationAt"
    | "frequency"
    | "description";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: "createdAt", label: "Date created" },
    { value: "amount", label: "Amount" },
    { value: "nextGenerationAt", label: "Next due" },
    { value: "frequency", label: "Frequency" },
    { value: "description", label: "Description" },
];

const FREQUENCY_ORDER = { daily: 0, weekly: 1, monthly: 2, yearly: 3 };

export default function RecurringClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>("nextGenerationAt");
    const [sortAsc, setSortAsc] = useState(true);
    const [hideInactive, setHideInactive] = useState(false);
    const [showDimes, setShowDimes] = useState(true);
    const [showBucks, setShowBucks] = useState(true);
    const [showIncome, setShowIncome] = useState(true);

    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });

    const { data: rules, isLoading } = useRecurringRules();
    const { data: categories } = useCategories();

    const sortedRules = useMemo(() => {
        if (!rules) return [];
        const dir = sortAsc ? 1 : -1;
        return [...rules]
            .filter((r) => !hideInactive || r.isActive)
            .filter((r) => (r.isBigBuck ? showBucks : showDimes))
            .filter((r) => showIncome || !r.isIncome)
            .sort((a, b) => {
                switch (sortBy) {
                    case "createdAt":
                        return dir * a.createdAt.localeCompare(b.createdAt);
                    case "amount":
                        return dir * (a.amount - b.amount);
                    case "nextGenerationAt":
                        return (
                            dir *
                            a.nextGenerationAt.localeCompare(b.nextGenerationAt)
                        );
                    case "frequency":
                        return (
                            dir *
                            (FREQUENCY_ORDER[a.frequency] -
                                FREQUENCY_ORDER[b.frequency])
                        );
                    case "description":
                        return dir * a.description.localeCompare(b.description);
                    default:
                        return 0;
                }
            });
    }, [
        rules,
        sortBy,
        sortAsc,
        hideInactive,
        showDimes,
        showBucks,
        showIncome,
    ]);

    function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSortBy(e.target.value as SortBy);
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Recurring Transactions</h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                <Checkbox isSelected={showDimes} onValueChange={setShowDimes}>
                    <span className="text-sm text-default-500">
                        Small dimes
                    </span>
                </Checkbox>
                <Checkbox isSelected={showBucks} onValueChange={setShowBucks}>
                    <span className="text-sm text-default-500">Big bucks</span>
                </Checkbox>
                <Checkbox isSelected={showIncome} onValueChange={setShowIncome}>
                    <span className="text-sm text-default-500">Income</span>
                </Checkbox>
                <Checkbox
                    isSelected={hideInactive}
                    onValueChange={setHideInactive}
                >
                    <span className="text-sm text-default-500">
                        Hide inactive
                    </span>
                </Checkbox>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-default-500">Sort by</span>
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className={`self-start ${SELECT_CLASSES}`}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setSortAsc((prev) => !prev)}
                        className={`
                        rounded-lg p-2
                        bg-default-100 border border-default-200
                        text-foreground
                        cursor-pointer hover:bg-default-200
                    `}
                        aria-label={
                            sortAsc ? "Sort descending" : "Sort ascending"
                        }
                    >
                        {sortAsc ? (
                            <ArrowUpAZ size={16} />
                        ) : (
                            <ArrowDownAZ size={16} />
                        )}
                    </button>
                </div>
            </div>
            <RecurringList
                rules={sortedRules}
                categories={categories ?? []}
                isLoading={isLoading}
            />

            <Tooltip
                content={<span className="text-center">Ctrl/Cmd + Enter</span>}
                placement="left"
            >
                <Button
                    color="primary"
                    className="fixed bottom-20 md:bottom-6 right-6 z-50 h-14 min-w-0"
                    onPress={() => setIsCreateOpen(true)}
                >
                    <Plus />
                    <span className="hidden md:inline">Add rule</span>
                </Button>
            </Tooltip>

            <RecurringRuleDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
