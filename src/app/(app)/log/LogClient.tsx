"use client";

import { Button, Checkbox, Input, Tooltip } from "@heroui/react";
import { Plus, Search } from "lucide-react";
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { SyncButton } from "@/components/SyncButton";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { createAction } from "@/lib/createAction";
import { useCategories } from "@/lib/hooks/useCategories";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useLogViewSettings } from "@/lib/hooks/useLogViewSettings";
import {
    useAllTransactions,
    useTransactionsByMonth,
    useTransactionsByYear,
} from "@/lib/hooks/useTransactions";
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

    const {
        isViewingBigBucks,
        setIsViewingBigBucks,
        shouldIncludeBucksInDimes,
        setShouldIncludeBucksInDimes,
    } = useLogViewSettings();

    const toggleViewingBigBucks = useCallback(
        () => setIsViewingBigBucks(!isViewingBigBucks),
        [isViewingBigBucks, setIsViewingBigBucks],
    );
    const toggleIncludeBucksInDimes = useCallback(() => {
        if (isViewingBigBucks) return;
        setShouldIncludeBucksInDimes(!shouldIncludeBucksInDimes);
    }, [isViewingBigBucks, shouldIncludeBucksInDimes, setShouldIncludeBucksInDimes]);
    useHotkey("b", toggleViewingBigBucks, { ctrlOrMeta: true });
    useHotkey("i", toggleIncludeBucksInDimes, { ctrlOrMeta: true });
    useHotkey("f", handleSearchHotkey, { ctrlOrMeta: true });

    const [selectedYear, setSelectedYear] = useState(DateTime.now().year);
    const [selectedMonth, setSelectedMonth] = useState<number>(
        DateTime.now().month,
    );
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<
        string[] | null
    >(null);

    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isSearching = searchQuery.trim().length > 0;

    const { data: monthlyTransactions, isLoading: isLoadingMonthly } =
        useTransactionsByMonth(selectedYear, selectedMonth);
    const { data: yearlyTransactions, isLoading: isLoadingYearly } =
        useTransactionsByYear(selectedYear);
    const { data: allTransactions, isLoading: isLoadingAll } =
        useAllTransactions();
    const { data: categories } = useCategories();

    function handleSearchHotkey() {
        if (isSearchMode) {
            searchInputRef.current?.focus();
            return;
        }
        setIsSearchMode(true);
    }

    function handleToggleSearchMode() {
        if (isSearchMode) {
            setIsSearchMode(false);
            setSearchQuery("");
            return;
        }
        setIsSearchMode(true);
    }

    function handleClearSearch() {
        setIsSearchMode(false);
        setSearchQuery("");
    }

    const queriedBucks = useMemo(() => {
        if (isViewingBigBucks) {
            return (yearlyTransactions ?? []).filter((t) => t.isBigBuck);
        }
        if (shouldIncludeBucksInDimes) {
            return (monthlyTransactions ?? []).filter((t) => t.isBigBuck);
        }
        return [];
    }, [
        isViewingBigBucks,
        shouldIncludeBucksInDimes,
        yearlyTransactions,
        monthlyTransactions,
    ]);

    const queriedDimes = useMemo(() => {
        if (isViewingBigBucks) return [];
        return (monthlyTransactions ?? []).filter((t) => !t.isBigBuck);
    }, [isViewingBigBucks, monthlyTransactions]);

    const transactions = useMemo(
        () => [...queriedDimes, ...queriedBucks],
        [queriedDimes, queriedBucks],
    );

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
        for (const tx of queriedBucks) {
            if (tx.categoryId) ids.add(tx.categoryId);
        }
        return ids;
    }, [queriedBucks]);

    const searchResults = useMemo(() => {
        if (!isSearching) return [];
        const query = searchQuery.trim().toLowerCase();
        return (allTransactions ?? [])
            .filter((t) => t.deletedAt === null)
            .filter(
                (t) => t.description?.toLowerCase().includes(query) ?? false,
            );
    }, [isSearching, searchQuery, allTransactions]);

    const isLoading = isViewingBigBucks ? isLoadingYearly : isLoadingMonthly;

    const viewingTypeRow = (
        <div className="flex items-center gap-3">
            <span className="text-sm text-default-500">Viewing:</span>
            <ToggleSwitch
                isSelectingRight={isViewingBigBucks}
                onValueChange={setIsViewingBigBucks}
                leftLabel="Small Dimes"
                rightLabel="Big Bucks"
            />
        </div>
    );

    const dimesControls = !isViewingBigBucks && (
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
    );

    const bucksControls = isViewingBigBucks && (
        <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={`self-start ${SELECT_CLASSES}`}
        >
            {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                    {y}
                </option>
            ))}
        </select>
    );

    const totalAndFilterRow = (
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
    );

    const viewingControls = !isSearchMode && (
        <div className="flex flex-col gap-3 mb-4">
            {viewingTypeRow}
            {dimesControls}
            {bucksControls}
            {totalAndFilterRow}
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Transactions</h2>
                    <SyncButton />
                </div>
                <Button
                    isIconOnly
                    variant={isSearchMode ? "flat" : "light"}
                    size="sm"
                    onPress={handleToggleSearchMode}
                    aria-label="Search transactions"
                >
                    <Search size={16} />
                </Button>
            </div>

            {isSearchMode && (
                <Input
                    ref={searchInputRef}
                    placeholder="Search by description"
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                    onKeyDown={(e) => e.key === "Escape" && handleClearSearch()}
                    startContent={
                        <Search size={16} className="text-default-400" />
                    }
                    isClearable
                    autoFocus
                    className="mb-4"
                    classNames={{
                        inputWrapper:
                            "data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0 rounded-md",
                    }}
                />
            )}

            {viewingControls}

            <DemoDataBanner />

            {isSearchMode ? (
                <TransactionList
                    transactions={searchResults}
                    categories={categories ?? []}
                    isLoading={isLoadingAll}
                />
            ) : (
                <TransactionList
                    transactions={filteredTransactions}
                    categories={categories ?? []}
                    isLoading={isLoading}
                />
            )}

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
                defaultIsBigBuck={isViewingBigBucks}
            />
        </div>
    );
}
