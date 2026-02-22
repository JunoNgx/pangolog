"use client";

import { useEffect, useState } from "react";
import { MONTH_NAMES, SELECT_CLASSES, YEAR_OPTIONS } from "@/lib/utils";

interface MonthYearPickerProps {
    selectedYear: number;
    selectedMonth: number;
    onYearChange: (year: number) => void;
    onMonthChange: (month: number) => void;
}

export function MonthYearPicker({
    selectedYear,
    selectedMonth,
    onYearChange,
    onMonthChange,
}: MonthYearPickerProps) {
    const [supportsMonthInput, setSupportsMonthInput] = useState(true);

    useEffect(() => {
        const input = document.createElement("input");
        input.type = "month";
        setSupportsMonthInput(input.type === "month");
    }, []);

    const monthValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

    function handleMonthInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const [y, m] = e.target.value.split("-").map(Number);
        if (y && m) {
            onYearChange(y);
            onMonthChange(m);
        }
    }

    function handleMonthSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        onMonthChange(Number(e.target.value));
    }

    function handleYearSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
        onYearChange(Number(e.target.value));
    }

    if (supportsMonthInput) {
        return (
            <input
                type="month"
                value={monthValue}
                onChange={handleMonthInputChange}
                className={`
                    w-42
                    ${SELECT_CLASSES}
                `}
            />
        );
    }

    return (
        <div className="flex gap-1">
            <select
                value={selectedMonth}
                onChange={handleMonthSelectChange}
                className={SELECT_CLASSES}
            >
                {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>
                        {name}
                    </option>
                ))}
            </select>
            <select
                value={selectedYear}
                onChange={handleYearSelectChange}
                className={SELECT_CLASSES}
            >
                {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
}
