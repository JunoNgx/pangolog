"use client";

import { Button, Checkbox, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { createAction } from "@/lib/createAction";
import { useBucks, useBucksByMonth } from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useDimes } from "@/lib/hooks/useDimes";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { formatAmount, SELECT_CLASSES, YEAR_OPTIONS } from "@/lib/utils";
import {
    CategoryFilterDropdown,
    UNCATEGORISED_ID,
} from "./CategoryFilterDropdown";
import { TransactionDialog } from "./TransactionDialog";
import { TransactionList } from "./TransactionList";

export default function LogClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });
    useEffect(
        () => createAction.register(openCreateDialog),
        [openCreateDialog],
    );

    const [isViewingBigBucks, setIsViewingBigBucks] = useState(false);
    const [shouldIncludeBucksInDimes, setShouldIncludeBucksInDimes] =
        useState(false);

    const toggleViewingBigBucks = useCallback(
        () => setIsViewingBigBucks((prev) => !prev),
        [],
    );
    const toggleIncludeBucksInDimes = useCallback(() => {
        if (isViewingBigBucks) return;
        setShouldIncludeBucksInDimes((prev) => !prev);
    }, [isViewingBigBucks]);
    useHotkey("b", toggleViewingBigBucks, { ctrlOrMeta: true });
    useHotkey("i", toggleIncludeBucksInDimes, { ctrlOrMeta: true });
    const [selectedYear, setSelectedYear] = useState(DateTime.now().year);
    const [selectedMonth, setSelectedMonth] = useState<number>(
        DateTime.now().month,
    );
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<
        string[] | null
    >(null);

    const { data: dimes, isLoading: isLoadingDimes } = useDimes(
        selectedYear,
        selectedMonth,
    );
    const { data: yearlyBucks, isLoading: isLoadingYearlyBucks } =
        useBucks(selectedYear);
    const { data: monthlyBucks, isLoading: isLoadingMonthlyBucks } =
        useBucksByMonth(selectedYear, selectedMonth);
    const { data: categories } = useCategories();

    const queriedBucks = useMemo(() => {
        if (isViewingBigBucks) {
            return yearlyBucks ?? [];
        }

        if (shouldIncludeBucksInDimes) {
            return monthlyBucks ?? [];
        }

        return [];
    }, [
        isViewingBigBucks,
        shouldIncludeBucksInDimes,
        yearlyBucks,
        monthlyBucks,
    ]);

    const queriedDimes = useMemo(() => {
        if (isViewingBigBucks) {
            return [];
        }

        return dimes ?? [];
    }, [isViewingBigBucks, dimes]);

    const transactions = useMemo(() => {
        return [...queriedDimes, ...queriedBucks];
    }, [queriedDimes, queriedBucks]);

    const filteredTransactions = useMemo(() => {
        if (selectedCategoryIds === null) return transactions;
        return transactions.filter((tx) => {
            if (tx.categoryId === null) {
                return selectedCategoryIds.includes(UNCATEGORISED_ID);
            }
            return selectedCategoryIds.includes(tx.categoryId);
        });
    }, [transactions, selectedCategoryIds]);

    const activeCategoryIds = useMemo(() => {
        const ids = new Set<string>();
        for (const tx of transactions) {
            if (tx.categoryId) ids.add(tx.categoryId);
        }
        return ids;
    }, [transactions]);

    const hasUncategorised = useMemo(
        () => transactions.some((tx) => tx.categoryId === null),
        [transactions],
    );

    const buckCategoryIds = useMemo(() => {
        const ids = new Set<string>();
        for (const tx of queriedBucks ?? []) {
            if (tx.categoryId) ids.add(tx.categoryId);
        }
        return ids;
    }, [queriedBucks]);

    const isLoading = useMemo(() => {
        if (isViewingBigBucks) return isLoadingYearlyBucks;

        if (shouldIncludeBucksInDimes)
            return isLoadingDimes || isLoadingMonthlyBucks;

        return isLoadingDimes;
    }, [
        isViewingBigBucks,
        shouldIncludeBucksInDimes,
        isLoadingDimes,
        isLoadingYearlyBucks,
        isLoadingMonthlyBucks,
    ]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Transactions</h2>

            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-default-500">Viewing:</span>
                    <ToggleSwitch
                        isSelectingRight={isViewingBigBucks}
                        onValueChange={setIsViewingBigBucks}
                        leftLabel="Small Dimes"
                        rightLabel="Big Bucks"
                    />
                </div>

                {!isViewingBigBucks && (
                    <div className="flex items-center justify-between gap-4">
                        <MonthYearPicker
                            selectedYear={selectedYear}
                            selectedMonth={selectedMonth}
                            onYearChange={(year) => setSelectedYear(year)}
                            onMonthChange={(month) => setSelectedMonth(month)}
                        />
                        <Checkbox
                            isSelected={shouldIncludeBucksInDimes}
                            onValueChange={setShouldIncludeBucksInDimes}
                            size="md"
                        >
                            <span className="text-sm">Include Big Bucks</span>
                        </Checkbox>
                    </div>
                )}

                {isViewingBigBucks && (
                    <select
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                        }
                        className={`self-start ${SELECT_CLASSES}`}
                    >
                        {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                )}

                <div className="flex items-center justify-between">
                    <span className="flex gap-2">
                        <span className="text-default-500">Total expense:</span>
                        <span
                            className="font-mono font-medium"
                            suppressHydrationWarning
                        >
                            {formatAmount(
                                filteredTransactions
                                    .filter((tx) => !tx.isIncome)
                                    .reduce((sum, tx) => sum + tx.amount, 0),
                            )}
                        </span>
                    </span>
                    <CategoryFilterDropdown
                        categories={categories ?? []}
                        selectedIds={selectedCategoryIds}
                        onChange={setSelectedCategoryIds}
                        activeCategoryIds={activeCategoryIds}
                        hasUncategorised={hasUncategorised}
                        buckCategoryIds={buckCategoryIds}
                    />
                </div>
            </div>

            <TransactionList
                transactions={filteredTransactions}
                categories={categories ?? []}
                isLoading={isLoading}
            />

            <Tooltip
                content={<span className="text-center">Ctrl/Cmd + Enter</span>}
                placement="left"
            >
                <Button
                    color="primary"
                    className="FloatingActionButton"
                    onPress={() => setIsCreateOpen(true)}
                >
                    <Plus />
                    <span className="hidden md:inline">Log transaction</span>
                </Button>
            </Tooltip>
            <TransactionDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                defaultIsCreatingBuck={isViewingBigBucks}
            />
        </div>
    );
}
