"use client";

import { Button, Input } from "@heroui/react";
import { Search } from "lucide-react";
import { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PeriodPicker } from "@/components/PeriodPicker";
import { RouteHeader } from "@/components/RouteHeader";
import { SyncButton } from "@/components/SyncButton";
import { TransactionTypeCheckboxes } from "@/components/TransactionTypeCheckboxes";
import { commandPaletteCreateActions } from "@/lib/commandPaletteActionRegistry";
import { useCategories } from "@/lib/hooks/useCategories";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useLogViewSettings } from "@/lib/hooks/useLogViewSettings";
import { useSyncFn } from "@/lib/hooks/useSync";

const OfflineIndicator = dynamic(
    () =>
        import("@/components/OfflineIndicator").then((m) => m.OfflineIndicator),
    { ssr: false },
);

import { UNCATEGORISED_ID } from "@/lib/constants";
import {
    useAllTransactions,
    useTransactionsByMonth,
    useTransactionsByYear,
} from "@/lib/hooks/useTransactions";
import { formatAmount } from "@/lib/utils";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { TransactionDialog } from "./TransactionDialog";
import { TransactionList } from "./TransactionList";

export default function LogClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });
    useEffect(() => {
        commandPaletteCreateActions.register(openCreateDialog);
        return () => commandPaletteCreateActions.unregister();
    }, [openCreateDialog]);

    const {
        shouldShowSmallDimes,
        setShouldShowSmallDimes,
        shouldShowBigBucks,
        setShouldShowBigBucks,
    } = useLogViewSettings();

    const isOnlyBigBucks = !shouldShowSmallDimes && shouldShowBigBucks;

    const toggleShouldShowSmallDimes = useCallback(
        () => setShouldShowSmallDimes(!shouldShowSmallDimes),
        [shouldShowSmallDimes, setShouldShowSmallDimes],
    );
    const toggleShouldShowBigBucks = useCallback(
        () => setShouldShowBigBucks(!shouldShowBigBucks),
        [shouldShowBigBucks, setShouldShowBigBucks],
    );
    useHotkey("U", toggleShouldShowSmallDimes, {
        ctrlOrMeta: true,
        shift: true,
    });
    useHotkey("I", toggleShouldShowBigBucks, {
        ctrlOrMeta: true,
        shift: true,
    });
    useHotkey("f", handleSearchHotkey, { ctrlOrMeta: true });

    const { sync } = useSyncFn();
    const triggerSync = useCallback(() => sync(), [sync]);
    useHotkey("s", triggerSync, { ctrlOrMeta: true });

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
        if (isOnlyBigBucks) {
            return (yearlyTransactions ?? []).filter((t) => t.isBigBuck);
        }
        if (shouldShowBigBucks) {
            return (monthlyTransactions ?? []).filter((t) => t.isBigBuck);
        }
        return [];
    }, [
        isOnlyBigBucks,
        shouldShowBigBucks,
        yearlyTransactions,
        monthlyTransactions,
    ]);

    const queriedDimes = useMemo(() => {
        if (!shouldShowSmallDimes) return [];
        return (monthlyTransactions ?? []).filter((t) => !t.isBigBuck);
    }, [shouldShowSmallDimes, monthlyTransactions]);

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

    const isLoading = isOnlyBigBucks ? isLoadingYearly : isLoadingMonthly;

    const pickerAndCheckboxRow = (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <PeriodPicker
                isYearly={isOnlyBigBucks}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
            />
            <TransactionTypeCheckboxes
                shouldShowSmallDimes={shouldShowSmallDimes}
                onSmallDimesChange={setShouldShowSmallDimes}
                shouldShowBigBucks={shouldShowBigBucks}
                onBigBucksChange={setShouldShowBigBucks}
            />
        </div>
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
            {(activeCategoryIds.size > 0 || hasUncategorised) && (
                <CategoryFilterDropdown
                    categories={categories ?? []}
                    selectedIds={selectedCategoryIds}
                    onChange={setSelectedCategoryIds}
                    activeCategoryIds={activeCategoryIds}
                    hasUncategorised={hasUncategorised}
                    buckCategoryIds={buckCategoryIds}
                />
            )}
        </div>
    );

    const viewingControls = !isSearchMode && (
        <div className="flex flex-col gap-3 mb-4">
            {pickerAndCheckboxRow}
            {totalAndFilterRow}
        </div>
    );

    return (
        <div>
            <RouteHeader
                label="Transactions"
                leftContent={
                    <>
                        <SyncButton />
                        <OfflineIndicator
                            variant="icon"
                            isSuppressedWhenDisconnected
                        />
                    </>
                }
                rightContent={
                    <Button
                        isIconOnly
                        variant={isSearchMode ? "flat" : "light"}
                        size="sm"
                        onPress={handleToggleSearchMode}
                        aria-label="Search transactions"
                    >
                        <Search size={16} />
                    </Button>
                }
            />

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

            <FloatingActionButton
                label="Log"
                onPress={() => setIsCreateOpen(true)}
            />
            <TransactionDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                defaultIsBigBuck={isOnlyBigBucks}
            />
        </div>
    );
}
