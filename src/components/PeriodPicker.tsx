"use client";

import { MonthYearPicker } from "@/components/MonthYearPicker";
import { SELECT_CLASSES, YEAR_OPTIONS } from "@/lib/utils";

interface PeriodPickerProps {
    isYearly: boolean;
    selectedYear: number;
    selectedMonth: number;
    onYearChange: (year: number) => void;
    onMonthChange: (month: number) => void;
}

export function PeriodPicker({
    isYearly,
    selectedYear,
    selectedMonth,
    onYearChange,
    onMonthChange,
}: PeriodPickerProps) {
    if (isYearly) {
        return (
            <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className={`w-fit ${SELECT_CLASSES}`}
            >
                {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <MonthYearPicker
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
        />
    );
}
