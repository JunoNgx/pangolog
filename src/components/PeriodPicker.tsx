"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { SELECT_CLASSES, YEAR_OPTIONS } from "@/lib/constants";
import { useHotkey } from "@/lib/hooks/useHotkey";

interface PeriodPickerProps {
    isYearly: boolean;
    selectedYear: number;
    selectedMonth: number;
    onYearChange: (year: number) => void;
    onMonthChange: (month: number) => void;
}

const MIN_YEAR = YEAR_OPTIONS[0];
const MAX_YEAR = YEAR_OPTIONS[YEAR_OPTIONS.length - 1];

export function PeriodPicker({
    isYearly,
    selectedYear,
    selectedMonth,
    onYearChange,
    onMonthChange,
}: PeriodPickerProps) {
    function handlePrev() {
        if (isYearly) {
            if (selectedYear <= MIN_YEAR) return;
            onYearChange(selectedYear - 1);
            return;
        }
        if (selectedMonth === 1) {
            if (selectedYear <= MIN_YEAR) return;
            onYearChange(selectedYear - 1);
            onMonthChange(12);
            return;
        }
        onMonthChange(selectedMonth - 1);
    }

    function handleNext() {
        if (isYearly) {
            if (selectedYear >= MAX_YEAR) return;
            onYearChange(selectedYear + 1);
            return;
        }
        if (selectedMonth === 12) {
            if (selectedYear >= MAX_YEAR) return;
            onYearChange(selectedYear + 1);
            onMonthChange(1);
            return;
        }
        onMonthChange(selectedMonth + 1);
    }

    useHotkey("[", handlePrev);
    useHotkey("]", handleNext);

    const isPrevDisabled = isYearly
        ? selectedYear <= MIN_YEAR
        : selectedYear <= MIN_YEAR && selectedMonth === 1;

    const isNextDisabled = isYearly
        ? selectedYear >= MAX_YEAR
        : selectedYear >= MAX_YEAR && selectedMonth === 12;

    const picker = isYearly ? (
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
    ) : (
        <MonthYearPicker
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
        />
    );

    const chevronClasses = `
        min-w-0
        w-9 h-9 p-0
    `;

    return (
        <div className="justify flex flex-1 items-center justify-between gap-1">
            <Button
                size="sm"
                variant="ghost"
                isDisabled={isPrevDisabled}
                onPress={handlePrev}
                className={chevronClasses}
                aria-label={
                    isYearly ? "Go to previous year" : "Go to previous month"
                }
            >
                <ChevronLeft size={14} />
            </Button>
            {picker}
            <Button
                size="sm"
                variant="ghost"
                isDisabled={isNextDisabled}
                onPress={handleNext}
                className={chevronClasses}
                aria-label={isYearly ? "Go to next year" : "Go to next month"}
            >
                <ChevronRight size={14} />
            </Button>
        </div>
    );
}
