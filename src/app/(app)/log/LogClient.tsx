"use client";

import { Button, Checkbox } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useBucks } from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useDimes } from "@/lib/hooks/useDimes";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useLogStore } from "@/lib/store/useLogStore";
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

    const {
        isViewingBigBucks,
        shouldIncludeBucksInDimes,
        selectedYear,
        selectedMonth,
        selectedCategoryIds,
        setIsViewingBigBucks,
        setShouldIncludeBucksInDimes,
        setSelectedYear,
        setSelectedMonth,
        setSelectedCategoryIds,
    } = useLogStore();

    const { data: dimes, isLoading: dimesLoading } = useDimes(
        selectedYear,
        selectedMonth,
    );
    const { data: bucks, isLoading: bucksLoading } = useBucks(selectedYear);
    const { data: categories } = useCategories();

    const transactions = useMemo(() => {
        if (isViewingBigBucks) {
            return bucks ?? [];
        }
        const base = dimes ?? [];
        if (shouldIncludeBucksInDimes) {
            return [...base, ...(bucks ?? [])];
        }
        return base;
    }, [isViewingBigBucks, shouldIncludeBucksInDimes, dimes, bucks]);

    const filteredTransactions = useMemo(() => {
        if (selectedCategoryIds === null) return transactions;
        return transactions.filter((tx) => {
            if (tx.categoryId === null) {
                return selectedCategoryIds.includes(UNCATEGORISED_ID);
            }
            return selectedCategoryIds.includes(tx.categoryId);
        });
    }, [transactions, selectedCategoryIds]);

    const isLoading = isViewingBigBucks
        ? bucksLoading
        : dimesLoading || (shouldIncludeBucksInDimes && bucksLoading);

    const [supportsMonthInput, setSupportsMonthInput] = useState(true);

    useEffect(() => {
        const input = document.createElement("input");
        input.type = "month";
        setSupportsMonthInput(input.type === "month");
    }, []);

    const monthValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

    function handleMonthChange(value: string) {
        const [y, m] = value.split("-").map(Number);
        if (y && m) {
            setSelectedYear(y);
            setSelectedMonth(m);
        }
    }

    function handleMonthSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedMonth(Number(e.target.value));
    }

    function handleYearSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedYear(Number(e.target.value));
    }

    const standardMonthSelector = (
        <input
            type="month"
            value={monthValue}
            onChange={(e) => handleMonthChange(e.target.value)}
            className={`
                w-42
                rounded-lg px-3 py-2
                font-mono text-sm text-foreground
                bg-default-100 border border-default-200
                cursor-pointer
            `}
        />
    );

    const fallbackMonthNames = [
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

    const fallbackSelectClasses = `
        rounded-lg px-3 py-2
        font-mono text-sm text-foreground
        bg-default-100 border border-default-200
        cursor-pointer
    `;

    const fallbackYearOptions = Array.from({ length: 21 }, (_, i) => {
        return new Date().getFullYear() - 10 + i;
    });

    const fallbackMonthSelector = (
        <div className="flex gap-1">
            <select
                value={selectedMonth}
                onChange={handleMonthSelect}
                className={fallbackSelectClasses}
            >
                {fallbackMonthNames.map((name, i) => (
                    <option key={name} value={i + 1}>
                        {name}
                    </option>
                ))}
            </select>
            <select
                value={selectedYear}
                onChange={handleYearSelect}
                className={fallbackSelectClasses}
            >
                {fallbackYearOptions.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div>
            <h2 className="font-mono text-xl font-bold mb-4">Transactions</h2>

            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-default-500">
                        Viewing:
                    </span>
                    <ToggleSwitch
                        isSelectingRight={isViewingBigBucks}
                        onValueChange={setIsViewingBigBucks}
                        leftLabel="Small Dimes"
                        rightLabel="Big Bucks"
                    />
                </div>

                {!isViewingBigBucks && (
                    <div className="flex items-center justify-between gap-4">
                        {supportsMonthInput
                            ? standardMonthSelector
                            : fallbackMonthSelector}
                        <Checkbox
                            isSelected={shouldIncludeBucksInDimes}
                            onValueChange={setShouldIncludeBucksInDimes}
                            size="sm"
                        >
                            <span className="font-mono text-sm">
                                Include Big Bucks
                            </span>
                        </Checkbox>
                    </div>
                )}

                <div className="self-end">
                    <CategoryFilterDropdown
                        categories={categories ?? []}
                        selectedIds={selectedCategoryIds}
                        onChange={setSelectedCategoryIds}
                    />
                </div>
            </div>

            <TransactionList
                transactions={filteredTransactions}
                categories={categories ?? []}
                isLoading={isLoading}
            />

            <Button
                color="primary"
                className="fixed bottom-20 md:bottom-6 right-6 z-50 h-14 w-14 min-w-0 text-2xl"
                onPress={() => setIsCreateOpen(true)}
            >
                +
            </Button>
            <TransactionDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                defaultIsCreatingBuck={isViewingBigBucks}
            />
        </div>
    );
}
