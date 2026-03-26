"use client";

import { useCallback, useMemo } from "react";
import { PeriodPicker } from "@/components/PeriodPicker";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { TransactionTypeCheckboxes } from "@/components/TransactionTypeCheckboxes";
import type { Category, Transaction } from "@/lib/db/types";
import { useCategories } from "@/lib/hooks/useCategories";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useSummaryViewSettings } from "@/lib/hooks/useSummaryViewSettings";
import {
    useTransactionsByMonth,
    useTransactionsByYear,
} from "@/lib/hooks/useTransactions";
import { formatAmount } from "@/lib/utils";

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
                <p className="font-semibold text-default-500 mb-2">{label}</p>
                <p className="text-sm text-default-400">No data.</p>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
                <p className="font-semibold text-default-500">{label}</p>
                <p className="font-mono text-sm font-semibold text-default-700">
                    {formatAmount(total)}
                </p>
            </div>
            <div className="flex rounded-none overflow-hidden h-5 mb-3">
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
            <ul className="MainListContainer gap-1">
                {slices.map((slice) => (
                    <li
                        key={slice.categoryId ?? `__${slice.name}__`}
                        className={`flex items-center gap-2 text-sm py-1 border-b border-dashed border-default-200`}
                    >
                        <span
                            className="shrink-0 w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: slice.colour }}
                        />
                        <span className="flex-1 text-default-700">
                            <span className="mr-1">
                                {slice.icon ? `${slice.icon} ` : ""}
                            </span>
                            {slice.name}
                        </span>
                        <span className="font-mono text-default-500">
                            {formatAmount(slice.total)}
                        </span>
                        <span className="font-mono text-default-400 w-14 text-right">
                            {slice.pct.toFixed(1)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function SummaryClient() {
    const {
        isYearly,
        setIsYearly,
        shouldShowSmallDimes,
        setShouldShowSmallDimes,
        shouldShowBigBucks,
        setShouldShowBigBucks,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
    } = useSummaryViewSettings();

    const toggleShouldShowSmallDimes = useCallback(
        () => setShouldShowSmallDimes(!shouldShowSmallDimes),
        [shouldShowSmallDimes, setShouldShowSmallDimes],
    );
    const toggleShouldShowBigBucks = useCallback(
        () => setShouldShowBigBucks(!shouldShowBigBucks),
        [shouldShowBigBucks, setShouldShowBigBucks],
    );
    const toggleIsYearly = useCallback(
        () => setIsYearly(!isYearly),
        [isYearly, setIsYearly],
    );
    useHotkey("U", toggleShouldShowSmallDimes, {
        ctrlOrMeta: true,
        shift: true,
    });
    useHotkey("I", toggleShouldShowBigBucks, { ctrlOrMeta: true, shift: true });
    useHotkey("Y", toggleIsYearly, { ctrlOrMeta: true, shift: true });

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

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Summary</h2>

            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-default-500">Viewing:</span>
                    <ToggleSwitch
                        isSelectingRight={isYearly}
                        onValueChange={setIsYearly}
                        leftLabel="Monthly"
                        rightLabel="Yearly"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <PeriodPicker
                        isYearly={isYearly}
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
            </div>

            <SegmentBar
                label="Expenses"
                slices={expenseSlices}
                total={expenseTotal}
            />
            <SegmentBar
                label="Income"
                slices={incomeSlices}
                total={incomeTotal}
            />
        </div>
    );
}
