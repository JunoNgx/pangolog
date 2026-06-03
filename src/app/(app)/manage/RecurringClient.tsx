"use client";

import { Button } from "@heroui/react";
import { ArrowDownAZ, ArrowUpAZ, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigWrapper } from "@/components/ConfigWrapper";
import { DemoDataBanner } from "@/components/DemoDataBanner";
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
    useHotkey("Enter", openCreateDialog, { hasMod: true });
    useEffect(() => {
        commandPaletteCreateActions.register(openCreateDialog);
        return () => commandPaletteCreateActions.unregister();
    }, [openCreateDialog]);

    const { data: rules } = useRecurringRules();
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

    const sortControls = (
        <div className="flex items-center gap-2">
            <span className="text-muted text-sm">Sort by</span>
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
                className={`bg-surface text-foreground hover:bg-surface-secondary cursor-pointer rounded-lg border p-2`}
                aria-label={sortAsc ? "Sort descending" : "Sort ascending"}
            >
                {sortAsc ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
            </button>
        </div>
    );

    return (
        <div>
            <ConfigWrapper className="mt-4 mb-4">
                <div className="flex w-full items-center justify-between gap-2">
                    {sortControls}
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
            <ConfigWrapper className="mb-4 flex justify-end">
                <Button
                    variant="tertiary"
                    onPress={() => setIsCreateOpen(true)}
                >
                    <Plus />
                    <span>Rule</span>
                </Button>
            </ConfigWrapper>
            <RecurringList rules={sortedRules} categories={categories ?? []} />

            <RecurringRuleDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
