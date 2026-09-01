"use client";

import { Button, SearchField } from "@heroui/react";
import { Search } from "lucide-react";
import { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SyncButton } from "@/app/(app)/log/SyncButton";
import { ConfigWrapper } from "@/components/ConfigWrapper";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PeriodPicker } from "@/components/PeriodPicker";
import { TransactionTypeDropdown } from "@/components/TransactionTypeDropdown";
import { commandPaletteCreateActions } from "@/lib/commandPaletteActionRegistry";
import { useRouteHeader } from "@/lib/context/RouteHeaderContext";
import { useCategories } from "@/lib/hooks/useCategories";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useSyncFn } from "@/lib/hooks/useSync";
import { useLogViewSettingsStore } from "@/lib/store/useLogViewSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

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
    useHotkey("Enter", openCreateDialog, { hasMod: true });
    useEffect(() => {
        commandPaletteCreateActions.register(openCreateDialog);
        return () => commandPaletteCreateActions.unregister();
    }, [openCreateDialog]);

    const logViewDisplayMode = useLogViewSettingsStore(
        (s) => s.logViewDisplayMode,
    );
    const setLogViewDisplayMode = useLogViewSettingsStore(
        (s) => s.setLogViewDisplayMode,
    );

    const shouldShowSmallDimes = logViewDisplayMode !== "bucks";
    const shouldShowBigBucks = logViewDisplayMode !== "dimes";
    const isOnlyBigBucks = logViewDisplayMode === "bucks";

    useHotkey("f", handleSearchHotkey, { hasMod: true });

    function handleCycleDisplayMode() {
        if (logViewDisplayMode === "dimes") {
            setLogViewDisplayMode("bucks");
            return;
        }
        if (logViewDisplayMode === "bucks") {
            setLogViewDisplayMode("all");
            return;
        }
        setLogViewDisplayMode("dimes");
    }

    useHotkey("u", handleCycleDisplayMode, { hasMod: true, hasShift: true });

    const { sync } = useSyncFn();
    const triggerSync = useCallback(() => sync(), [sync]);
    useHotkey("s", triggerSync, { hasMod: true });

    const [selectedYear, setSelectedYear] = useState(DateTime.now().year);
    const [selectedMonth, setSelectedMonth] = useState<number>(
        DateTime.now().month,
    );
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<
        string[] | null
    >(null);
    const _shouldShowUnknownCategoriesAsOne = useProfileSettingsStore(
        (state) => state.shouldShowUnknownCategoriesAsOne,
    );

    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isSearching = searchQuery.trim().length > 0;

    const { data: monthlyTransactions } = useTransactionsByMonth(
        selectedYear,
        selectedMonth,
    );
    const { data: yearlyTransactions } = useTransactionsByYear(selectedYear);
    const { data: allTransactions } = useAllTransactions();
    const { data: categories } = useCategories();

    const unknownCategoryIds = useMemo(() => {
        const categoryIds = new Set(
            (categories ?? []).map((category) => category.id),
        );
        const unknownIds = new Set<string>();
        for (const transaction of allTransactions ?? []) {
            if (
                transaction.deletedAt !== null ||
                transaction.categoryId === null
            ) {
                continue;
            }
            if (!categoryIds.has(transaction.categoryId)) {
                unknownIds.add(transaction.categoryId);
            }
        }
        return [...unknownIds].sort();
    }, [allTransactions, categories]);

    useEffect(() => {
        setSelectedCategoryIds(null);
    }, []);

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

    useRouteHeader({
        label: "Transactions",
        leftContent: !isSearchMode && (
            <Button
                isIconOnly
                variant="outline"
                size="sm"
                onPress={handleToggleSearchMode}
                aria-label="Search transactions"
                className="app-shadow-hard-sm"
            >
                <Search size={16} />
            </Button>
        ),
        rightContent: !isSearchMode && (
            <TransactionTypeDropdown
                displayMode={logViewDisplayMode}
                setDisplayMode={setLogViewDisplayMode}
            />
        ),
    });

    function handleClearSearch() {
        setIsSearchMode(false);
        setSearchQuery("");
    }

    function handleSearchInputKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (e.key === "Escape") {
            handleClearSearch();
        }
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

    const periodPickerRow = (
        <PeriodPicker
            isYearly={isOnlyBigBucks}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
        />
    );

    const syncButtonRow = (
        <div className="flex items-center justify-center gap-2">
            <SyncButton />
            <OfflineIndicator variant="icon" isSuppressedWhenDisconnected />
        </div>
    );

    const totalAndFilterRow = (
        <div className="flex items-center justify-between">
            <span className="flex gap-2">
                <span className="text-muted">Total expense:</span>
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
                unknownCategoryIds={unknownCategoryIds}
                selectedIds={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
                buckCategoryIds={buckCategoryIds}
            />
        </div>
    );

    const viewingControls = (
        <div className="mb-4 flex flex-col gap-3">
            {periodPickerRow}
            {syncButtonRow}
            {totalAndFilterRow}
        </div>
    );

    const searchInputRow = (
        <div className="flex items-center gap-2">
            <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                autoFocus
                fullWidth
            >
                <SearchField.Group className="rounded-md data-[focus-visible=true]:ring-0 data-[focus-visible=true]:ring-offset-0">
                    <SearchField.SearchIcon />
                    <SearchField.Input
                        ref={searchInputRef}
                        placeholder="Search by description"
                        onKeyDown={handleSearchInputKeyDown}
                    />
                    <SearchField.ClearButton />
                </SearchField.Group>
            </SearchField>
            <Button variant="ghost" size="sm" onPress={handleClearSearch}>
                Cancel
            </Button>
        </div>
    );

    return (
        <div>
            <ConfigWrapper className="mb-6">
                {isSearchMode ? (
                    searchInputRow
                ) : (
                    <>
                        {viewingControls}
                        <DemoDataBanner />
                    </>
                )}
            </ConfigWrapper>

            {isSearchMode ? (
                <TransactionList
                    transactions={searchResults}
                    categories={categories ?? []}
                />
            ) : (
                <TransactionList
                    transactions={filteredTransactions}
                    categories={categories ?? []}
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
