"use client";

import { Checkbox } from "@heroui/react";
import { useMemo } from "react";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { Buck, Category, Dime } from "@/lib/db/types";
import { useBucks } from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useDimes, useDimesByYear } from "@/lib/hooks/useDimes";
import { useSummaryStore } from "@/lib/store/useSummaryStore";
import { formatAmount, SELECT_CLASSES, YEAR_OPTIONS } from "@/lib/utils";

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
    transactions: (Dime | Buck)[],
    categoryMap: Map<string, Category>,
    isIncome: boolean,
): SliceResult {
    const filtered = transactions.filter((t) => t.isIncome === isIncome);

    const totalsById = new Map<string | null, number>();
    for (const tx of filtered) {
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
            <div className="flex rounded-md overflow-hidden h-5 mb-3">
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
                        <span className="font-mono text-default-400 w-10 text-right">
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
        isViewingBucksOnly,
        includeBucks,
        selectedYear,
        selectedMonth,
        setIsYearly,
        setIsViewingBucksOnly,
        setIncludeBucks,
        setSelectedYear,
        setSelectedMonth,
    } = useSummaryStore();

    const { data: categories } = useCategories();
    const { data: monthlyDimes } = useDimes(selectedYear, selectedMonth);
    const { data: yearlyDimes } = useDimesByYear(selectedYear);
    const { data: bucks } = useBucks(selectedYear);

    const categoryMap = useMemo(
        () => new Map((categories ?? []).map((c) => [c.id, c])),
        [categories],
    );

    const transactions = useMemo<(Dime | Buck)[]>(() => {
        if (isYearly && isViewingBucksOnly) return bucks ?? [];
        const dimes = isYearly ? (yearlyDimes ?? []) : (monthlyDimes ?? []);
        if (isYearly && includeBucks) return [...dimes, ...(bucks ?? [])];
        return dimes;
    }, [
        isYearly,
        isViewingBucksOnly,
        includeBucks,
        monthlyDimes,
        yearlyDimes,
        bucks,
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

                {isYearly && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-default-500">Type:</span>
                        <ToggleSwitch
                            isSelectingRight={isViewingBucksOnly}
                            onValueChange={setIsViewingBucksOnly}
                            leftLabel="Small Dimes"
                            rightLabel="Big Bucks"
                        />
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                    {isYearly ? (
                        <select
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(Number(e.target.value))
                            }
                            className={SELECT_CLASSES}
                        >
                            {YEAR_OPTIONS.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <MonthYearPicker
                            selectedYear={selectedYear}
                            selectedMonth={selectedMonth}
                            onYearChange={setSelectedYear}
                            onMonthChange={setSelectedMonth}
                        />
                    )}
                    {isYearly && !isViewingBucksOnly && (
                        <Checkbox
                            isSelected={includeBucks}
                            onValueChange={setIncludeBucks}
                            size="md"
                        >
                            <span className="text-sm">Include Big Bucks</span>
                        </Checkbox>
                    )}
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
