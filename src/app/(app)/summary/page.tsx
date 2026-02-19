"use client";

import { Checkbox } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { Buck, Category, Dime } from "@/lib/db/types";
import { useBucks } from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useDimes, useDimesByYear } from "@/lib/hooks/useDimes";
import { useSummaryStore } from "@/lib/store/useSummaryStore";
import { formatAmount } from "@/lib/utils";

const MIN_PCT = 3;
const OTHER_COLOUR = "#9ca3af";

interface CategorySlice {
    categoryId: string | null;
    name: string;
    icon: string;
    colour: string;
    total: number;
    pct: number;
}

function buildSlices(
    transactions: (Dime | Buck)[],
    categoryMap: Map<string, Category>,
    isIncome: boolean,
): CategorySlice[] {
    const filtered = transactions.filter((t) => t.isIncome === isIncome);

    const totalsById = new Map<string | null, number>();
    for (const tx of filtered) {
        const key = tx.categoryId ?? null;
        totalsById.set(key, (totalsById.get(key) ?? 0) + tx.amount);
    }

    const grandTotal = [...totalsById.values()].reduce((a, b) => a + b, 0);
    if (grandTotal === 0) return [];

    const slices: CategorySlice[] = [];
    let otherTotal = 0;

    for (const [categoryId, total] of totalsById) {
        const pct = (total / grandTotal) * 100;
        const cat = categoryId ? categoryMap.get(categoryId) : undefined;

        if (pct < MIN_PCT) {
            otherTotal += total;
            continue;
        }

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

    if (otherTotal > 0) {
        const otherPct = (otherTotal / grandTotal) * 100;
        slices.push({
            categoryId: null,
            name: "Other",
            icon: "",
            colour: OTHER_COLOUR,
            total: otherTotal,
            pct: otherPct,
        });
    }

    return slices;
}

interface SegmentBarProps {
    label: string;
    slices: CategorySlice[];
}

function SegmentBar({ label, slices }: SegmentBarProps) {
    if (slices.length === 0) {
        return (
            <div className="mb-6">
                <p className="font-mono text-sm font-semibold text-default-500 mb-2">
                    {label}
                </p>
                <p className="font-mono text-xs text-default-400">No data.</p>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <p className="font-mono text-sm font-semibold text-default-500 mb-2">
                {label}
            </p>
            <div className="flex rounded-full overflow-hidden h-5 mb-3">
                {slices.map((slice) => (
                    <div
                        key={slice.categoryId ?? "__other__"}
                        style={{
                            width: `${slice.pct}%`,
                            backgroundColor: slice.colour,
                        }}
                        title={`${slice.name} ${slice.pct.toFixed(1)}%`}
                    />
                ))}
            </div>
            <ul className="flex flex-col gap-1">
                {slices.map((slice) => (
                    <li
                        key={slice.categoryId ?? "__other__"}
                        className="flex items-center gap-2 font-mono text-xs"
                    >
                        <span
                            className="shrink-0 w-2 h-2 rounded-full"
                            style={{ backgroundColor: slice.colour }}
                        />
                        <span className="flex-1 text-default-700">
                            {slice.icon ? `${slice.icon} ` : ""}
                            {slice.name}
                        </span>
                        <span className="text-default-500">
                            {formatAmount(slice.total)}
                        </span>
                        <span className="text-default-400 w-10 text-right">
                            {slice.pct.toFixed(1)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function SummaryPage() {
    const {
        isYearly,
        includeBucks,
        selectedYear,
        selectedMonth,
        setIsYearly,
        setIncludeBucks,
        setSelectedYear,
        setSelectedMonth,
    } = useSummaryStore();

    const { data: categories } = useCategories();
    const { data: monthlyDimes } = useDimes(selectedYear, selectedMonth);
    const { data: yearlyDimes } = useDimesByYear(selectedYear);
    const { data: bucks } = useBucks(selectedYear);

    const [supportsMonthInput, setSupportsMonthInput] = useState(true);
    useEffect(() => {
        const input = document.createElement("input");
        input.type = "month";
        setSupportsMonthInput(input.type === "month");
    }, []);

    const categoryMap = useMemo(
        () => new Map((categories ?? []).map((c) => [c.id, c])),
        [categories],
    );

    const transactions = useMemo<(Dime | Buck)[]>(() => {
        const dimes = isYearly ? (yearlyDimes ?? []) : (monthlyDimes ?? []);
        if (isYearly && includeBucks) {
            return [...dimes, ...(bucks ?? [])];
        }
        return dimes;
    }, [isYearly, includeBucks, monthlyDimes, yearlyDimes, bucks]);

    const expenseSlices = useMemo(
        () => buildSlices(transactions, categoryMap, false),
        [transactions, categoryMap],
    );
    const incomeSlices = useMemo(
        () => buildSlices(transactions, categoryMap, true),
        [transactions, categoryMap],
    );

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

    const selectClasses = `
        rounded-lg px-3 py-2
        font-mono text-sm text-foreground
        bg-default-100 border border-default-200
        cursor-pointer
    `;

    const yearOptions = Array.from({ length: 21 }, (_, i) => {
        return new Date().getFullYear() - 10 + i;
    });

    const monthNames = [
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

    const monthPicker = isYearly ? (
        <select
            value={selectedYear}
            onChange={handleYearSelect}
            className={selectClasses}
        >
            {yearOptions.map((y) => (
                <option key={y} value={y}>
                    {y}
                </option>
            ))}
        </select>
    ) : supportsMonthInput ? (
        <input
            type="month"
            value={monthValue}
            onChange={(e) => handleMonthChange(e.target.value)}
            className={`
                w-40
                rounded-lg px-3 py-2
                font-mono text-sm text-foreground
                bg-default-100 border border-default-200
                cursor-pointer
            `}
        />
    ) : (
        <div className="flex gap-1">
            <select
                value={selectedMonth}
                onChange={handleMonthSelect}
                className={selectClasses}
            >
                {monthNames.map((name, i) => (
                    <option key={name} value={i + 1}>
                        {name}
                    </option>
                ))}
            </select>
            <select
                value={selectedYear}
                onChange={handleYearSelect}
                className={selectClasses}
            >
                {yearOptions.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div>
            <h2 className="font-mono text-xl font-bold mb-4">Summary</h2>

            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-default-500">
                        Viewing:
                    </span>
                    <ToggleSwitch
                        isSelectingRight={isYearly}
                        onValueChange={setIsYearly}
                        leftLabel="Monthly"
                        rightLabel="Yearly"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    {monthPicker}
                    {isYearly && (
                        <Checkbox
                            isSelected={includeBucks}
                            onValueChange={setIncludeBucks}
                            size="sm"
                        >
                            <span className="font-mono text-sm">
                                Include Big Bucks
                            </span>
                        </Checkbox>
                    )}
                </div>
            </div>

            <SegmentBar label="Expenses" slices={expenseSlices} />
            <SegmentBar label="Income" slices={incomeSlices} />
        </div>
    );
}
