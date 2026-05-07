"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigWrapper } from "@/components/ConfigWrapper";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { commandPaletteCreateActions } from "@/lib/commandPaletteActionRegistry";
import { FREQUENCY_ORDER, SELECT_CLASSES } from "@/lib/constants";
import { useCategories } from "@/lib/hooks/useCategories";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useRecurringRules } from "@/lib/hooks/useRecurringRules";
import { RecurringFilterDropdown } from "./RecurringFilterDropdown";
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

export default function RecurringClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>("nextGenerationAt");
    const [sortAsc, setSortAsc] = useState(true);
    const [shouldHideInactive, setShouldHideInactive] = useState(false);
    const [shouldShowDimes, setShouldShowDimes] = useState(true);
    const [shouldShowBucks, setShouldShowBucks] = useState(true);
    const [shouldShowIncome, setShouldShowIncome] = useState(true);

    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });
    useEffect(() => {
        commandPaletteCreateActions.register(openCreateDialog);
        return () => commandPaletteCreateActions.unregister();
    }, [openCreateDialog]);

    const { data: rules, isLoading } = useRecurringRules();
    const { data: categories } = useCategories();

    const sortedRules = useMemo(() => {
        if (!rules) return [];
        const dir = sortAsc ? 1 : -1;
        return [...rules]
            .filter((r) => !shouldHideInactive || r.isActive)
            .filter((r) => (r.isBigBuck ? shouldShowBucks : shouldShowDimes))
            .filter((r) => shouldShowIncome || !r.isIncome)
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
        shouldHideInactive,
        shouldShowDimes,
        shouldShowBucks,
        shouldShowIncome,
    ]);

    function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSortBy(e.target.value as SortBy);
    }

    return (
        <div>
            <ConfigWrapper className="flex flex-col gap-4">
                <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                    <span className="text-default-500 text-sm">Sort by</span>
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
                        className={`bg-default-100 border-default-200 text-foreground hover:bg-default-200 cursor-pointer rounded-lg border p-2`}
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
                    <RecurringFilterDropdown
                        shouldShowDimes={shouldShowDimes}
                        shouldShowBucks={shouldShowBucks}
                        shouldShowIncome={shouldShowIncome}
                        shouldHideInactive={shouldHideInactive}
                        onShowDimesChange={setShouldShowDimes}
                        onShowBucksChange={setShouldShowBucks}
                        onShowIncomeChange={setShouldShowIncome}
                        onHideInactiveChange={setShouldHideInactive}
                    />
                </div>
                <DemoDataBanner />
            </ConfigWrapper>
            <RecurringList
                rules={sortedRules}
                categories={categories ?? []}
                isLoading={isLoading}
            />

            <FloatingActionButton
                label="Rule"
                onPress={() => setIsCreateOpen(true)}
            />

            <RecurringRuleDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
