"use client";

import { useCallback, useMemo } from "react";
import { PeriodViewDropdown } from "@/app/(app)/summary/PeriodViewDropdown";
import { ConfigWrapper } from "@/components/ConfigWrapper";
import { MainListContainer } from "@/components/MainListContainer";
import { PeriodPicker } from "@/components/PeriodPicker";
import { RouteHeader } from "@/components/RouteHeader";
import { TransactionTypeDropdown } from "@/components/TransactionTypeDropdown";
import type { Category, Transaction } from "@/lib/db/types";
import { useCategories } from "@/lib/hooks/useCategories";
import { useHotkey } from "@/lib/hooks/useHotkey";
import {
    useTransactionsByMonth,
    useTransactionsByYear,
} from "@/lib/hooks/useTransactions";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { useSummaryViewSettingsStore } from "@/lib/store/useSummaryViewSettingsStore";
import { formatAmount } from "@/lib/utils";
import ExpensesByMonthChart from "./ExpensesByMonthChart";

const OTHER_COLOUR = "#9ca3af";

interface CategorySlice {
    categoryId: string | null;
    name: string;
    icon: string;
    colour: string;
    total: number;
    pct: number;
}

interface SliceResult {
    slices: CategorySlice[];
    total: number;
}

function buildSlices(
    transactions: Transaction[],
    categoryMap: Map<string, Category>,
    isIncome: boolean,
): SliceResult {
    const filteredTransactions = transactions.filter(
        (t) => t.isIncome === isIncome,
    );

    const totalsById = new Map<string | null, number>();
    for (const tx of filteredTransactions) {
        const key = tx.categoryId ?? null;
        totalsById.set(key, (totalsById.get(key) ?? 0) + tx.amount);
    }

    const grandTotal = [...totalsById.values()].reduce((a, b) => a + b, 0);
    if (grandTotal === 0) return { slices: [], total: 0 };

    const slices: CategorySlice[] = [];

    for (const [categoryId, total] of totalsById) {
        const pct = (total / grandTotal) * 100;
        const cat = categoryId ? categoryMap.get(categoryId) : undefined;

        slices.push({
            categoryId,
            name: cat?.name ?? "Uncategorised",
            icon: cat?.icon ?? "",
            colour: cat?.colour ?? OTHER_COLOUR,
            total,
            pct,
        });
    }

    slices.sort((a, b) => b.total - a.total);

    return { slices, total: grandTotal };
}

interface SegmentBarProps {
    label: string;
    slices: CategorySlice[];
    total: number;
}

function SegmentBar({ label, slices, total }: SegmentBarProps) {
    if (slices.length === 0) {
        return (
            <div className="mb-6">
                <p className="text-muted mb-2 font-semibold">{label}</p>
                <p className="text-muted text-sm">No data.</p>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <div className="mb-2 flex items-baseline justify-between">
                <p className="text-muted font-semibold">{label}</p>
                <p className="text-default-700 font-mono text-sm font-semibold">
                    {formatAmount(total)}
                </p>
            </div>
            <div className="mb-3 flex h-5 overflow-hidden rounded-sm">
                {slices.map((slice) => (
                    <div
                        key={slice.categoryId ?? `__${slice.name}__`}
                        style={{
                            width: `${slice.pct}%`,
                            backgroundColor: slice.colour,
                        }}
                        title={`${slice.name} ${slice.pct.toFixed(1)}%`}
                    />
                ))}
            </div>
            <MainListContainer className="gap-1">
                {slices.map((slice) => (
                    <li
                        key={slice.categoryId ?? `__${slice.name}__`}
                        className={`border-default-200 flex items-center gap-2 border-b border-dashed py-1 text-sm`}
                    >
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: slice.colour }}
                        />
                        <span className="text-default-700 flex-1">
                            <span className="mr-1">
                                {slice.icon ? `${slice.icon} ` : ""}
                            </span>
                            {slice.name}
                        </span>
                        <span className="text-muted font-mono">
                            {formatAmount(slice.total)}
                        </span>
                        <span className="text-muted w-14 text-right font-mono">
                            {slice.pct.toFixed(1)}%
                        </span>
                    </li>
                ))}
            </MainListContainer>
        </div>
    );
}

export default function SummaryClient() {
    const { isExpenseOnlyMode } = useProfileSettingsStore();
    const {
        isYearly,
        setIsYearly,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        summaryViewDisplayMode,
        setSummaryViewDisplayMode,
    } = useSummaryViewSettingsStore();

    const shouldShowSmallDimes = summaryViewDisplayMode !== "bucks";
    const shouldShowBigBucks = summaryViewDisplayMode !== "dimes";

    function handleCycleDisplayMode() {
        if (summaryViewDisplayMode === "dimes") {
            setSummaryViewDisplayMode("bucks");
            return;
        }
        if (summaryViewDisplayMode === "bucks") {
            setSummaryViewDisplayMode("all");
            return;
        }
        setSummaryViewDisplayMode("dimes");
    }

    const toggleIsYearly = useCallback(
        () => setIsYearly(!isYearly),
        [isYearly, setIsYearly],
    );
    useHotkey("u", handleCycleDisplayMode, { hasMod: true, hasShift: true });
    useHotkey("y", toggleIsYearly, { hasMod: true, hasShift: true });

    const { data: categories } = useCategories();
    const { data: monthlyTransactions } = useTransactionsByMonth(
        selectedYear,
        selectedMonth,
    );
    const { data: yearlyTransactions } = useTransactionsByYear(selectedYear);

    const categoryMap = useMemo(
        () => new Map((categories ?? []).map((c) => [c.id, c])),
        [categories],
    );

    const transactions = useMemo<Transaction[]>(() => {
        if (!shouldShowSmallDimes && !shouldShowBigBucks) return [];

        const src = isYearly
            ? (yearlyTransactions ?? [])
            : (monthlyTransactions ?? []);
        const result: Transaction[] = [];

        if (shouldShowSmallDimes)
            result.push(...src.filter((t) => !t.isBigBuck));
        if (shouldShowBigBucks) result.push(...src.filter((t) => t.isBigBuck));

        return result;
    }, [
        isYearly,
        shouldShowSmallDimes,
        shouldShowBigBucks,
        monthlyTransactions,
        yearlyTransactions,
    ]);

    const { slices: expenseSlices, total: expenseTotal } = useMemo(
        () => buildSlices(transactions, categoryMap, false),
        [transactions, categoryMap],
    );
    const { slices: incomeSlices, total: incomeTotal } = useMemo(
        () => buildSlices(transactions, categoryMap, true),
        [transactions, categoryMap],
    );

    const expenseLabel = isYearly ? "Expenses by category" : "Expenses";

    return (
        <div>
            <RouteHeader
                label="Summary"
                leftContent={
                    <PeriodViewDropdown
                        isYearly={isYearly}
                        onViewChange={setIsYearly}
                    />
                }
                rightContent={
                    <TransactionTypeDropdown
                        displayMode={summaryViewDisplayMode}
                        setDisplayMode={setSummaryViewDisplayMode}
                    />
                }
            />

            <ConfigWrapper className="mt-4 mb-4">
                <PeriodPicker
                    isYearly={isYearly}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    onYearChange={setSelectedYear}
                    onMonthChange={setSelectedMonth}
                />
            </ConfigWrapper>

            {isYearly && <ExpensesByMonthChart transactions={transactions} />}

            <SegmentBar
                label={expenseLabel}
                slices={expenseSlices}
                total={expenseTotal}
            />
            {!isExpenseOnlyMode && (
                <SegmentBar
                    label="Income"
                    slices={incomeSlices}
                    total={incomeTotal}
                />
            )}
        </div>
    );
}
