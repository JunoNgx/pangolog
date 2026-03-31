import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { DateTime } from "luxon";
import type { Transaction } from "@/lib/db/types";
import { formatAmount } from "@/lib/utils";

const MONTH_LABELS = [
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

function buildExpensesByMonth(transactions: Transaction[]): number[] {
    const totals: number[] = new Array(12).fill(0);
    for (const tx of transactions) {
        if (tx.isIncome) continue;
        const month = DateTime.fromISO(tx.transactedAt).month;
        totals[month - 1] += tx.amount;
    }
    return totals;
}

interface ExpensesByMonthChartProps {
    transactions: Transaction[];
}

export default function ExpensesByMonthChart({
    transactions,
}: ExpensesByMonthChartProps) {
    const monthlyTotals = buildExpensesByMonth(transactions);
    const maxTotal = Math.max(...monthlyTotals);

    if (maxTotal === 0) {
        return (
            <div className="mb-6">
                <p className="font-semibold text-default-500 mb-2">
                    Expenses by month
                </p>
                <p className="text-sm text-default-400">No data.</p>
            </div>
        );
    }

    const tallestIndex = monthlyTotals.indexOf(maxTotal);
    const nonZeroMonthCount = monthlyTotals.filter((t) => t > 0).length;
    const average =
        monthlyTotals.reduce((a, b) => a + b, 0) / nonZeroMonthCount;
    const averagePct = (average / maxTotal) * 100;

    const bars = monthlyTotals.map((total, index) => (
        <Popover key={MONTH_LABELS[index]} placement="top">
            <PopoverTrigger>
                <div
                    className="relative flex-1 cursor-pointer"
                    style={{
                        height:
                            total > 0 ? `${(total / maxTotal) * 100}%` : "0%",
                    }}
                >
                    <div className="w-full h-full bg-default-400 rounded-sm" />
                    {index === tallestIndex && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-mono text-default-500 whitespace-nowrap">
                            {formatAmount(total)}
                        </span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent>
                <span className="text-xs font-mono">
                    {MONTH_LABELS[index]}: {formatAmount(total)}
                </span>
            </PopoverContent>
        </Popover>
    ));

    const monthLabels = MONTH_LABELS.map((label) => (
        <span
            key={label}
            className="flex-1 text-center text-xs text-default-400 font-mono"
        >
            {label}
        </span>
    ));

    const averageMarker = (
        <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{ bottom: `${averagePct}%` }}
        >
            <div className="border-t border-dashed border-primary-400" />
            <span className="absolute right-0 -top-5 text-xs font-mono text-primary-400 whitespace-nowrap">
                avg {formatAmount(average)}
            </span>
        </div>
    );

    return (
        <div className="mb-6">
            <p className="font-semibold text-default-500 mb-3">
                Expenses by month
            </p>
            <div className="relative flex items-end gap-1 h-24 mb-1 mt-10">
                {bars}
                {averageMarker}
            </div>
            <div className="flex gap-1">{monthLabels}</div>
        </div>
    );
}
