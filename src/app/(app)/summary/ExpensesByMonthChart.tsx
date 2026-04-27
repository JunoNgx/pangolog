import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { DateTime } from "luxon";
import { MONTH_NAMES } from "@/lib/constants";
import type { Transaction } from "@/lib/db/types";
import { formatAmount, formatAmountShort } from "@/lib/utils";

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
                <p className="text-default-500 mb-2 font-semibold">
                    Expenses by month
                </p>
                <p className="text-default-400 text-sm">No data.</p>
            </div>
        );
    }

    const tallestIndex = monthlyTotals.indexOf(maxTotal);
    const tallestLabelAlign =
        tallestIndex < 2
            ? "left-0 translate-x-0"
            : tallestIndex > 9
              ? "right-0 translate-x-0"
              : "left-1/2 -translate-x-1/2";
    const nonZeroMonthCount = monthlyTotals.filter((t) => t > 0).length;
    const average =
        monthlyTotals.reduce((a, b) => a + b, 0) / nonZeroMonthCount;
    const averagePct = (average / maxTotal) * 100;

    const bars = monthlyTotals.map((total, index) => (
        <Popover key={MONTH_NAMES[index]} placement="top">
            <PopoverTrigger>
                <div
                    className="relative flex-1 cursor-pointer"
                    style={{
                        height:
                            total > 0 ? `${(total / maxTotal) * 100}%` : "0%",
                    }}
                >
                    <div className="bg-default-400 h-full w-full rounded-sm" />
                    {index === tallestIndex && (
                        <span
                            className={`absolute -top-5 ${tallestLabelAlign} text-default-500 font-mono text-xs whitespace-nowrap`}
                        >
                            {formatAmountShort(total)}
                        </span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent>
                <span className="font-mono text-xs">
                    {MONTH_NAMES[index]}: {formatAmount(total)}
                </span>
            </PopoverContent>
        </Popover>
    ));

    const monthLabels = MONTH_NAMES.map((label) => (
        <span
            key={label}
            className="text-default-400 flex-1 text-center font-mono text-xs"
        >
            {label}
        </span>
    ));

    const averageMarker = (
        <div
            className="pointer-events-none absolute right-0 left-0"
            style={{ bottom: `${averagePct}%` }}
        >
            <div className="border-primary-400 border-t border-dashed" />
            <span className="text-primary-400 absolute -top-5 right-0 font-mono text-xs whitespace-nowrap">
                avg {formatAmount(average)}
            </span>
        </div>
    );

    return (
        <div className="mb-6">
            <p className="text-default-500 mb-3 font-semibold">
                Expenses by month
            </p>
            <div className="relative mt-10 mb-1 flex h-24 items-end gap-1">
                {bars}
                {averageMarker}
            </div>
            <div className="flex gap-1">{monthLabels}</div>
        </div>
    );
}
