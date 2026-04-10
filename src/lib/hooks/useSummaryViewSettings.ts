import { DateTime } from "luxon";
import { useState } from "react";

const STORAGE_KEY = "pangolog-summary-view-settings";

interface SummaryViewSettings {
    isYearly: boolean;
    shouldShowSmallDimes: boolean;
    shouldShowBigBucks: boolean;
    selectedYear: number;
    selectedMonth: number;
}

const DEFAULT_SETTINGS: SummaryViewSettings = {
    isYearly: false,
    shouldShowSmallDimes: true,
    shouldShowBigBucks: false,
    selectedYear: DateTime.now().year,
    selectedMonth: DateTime.now().month,
};

function loadSettings(): SummaryViewSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(settings: SummaryViewSettings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
}

export function useSummaryViewSettings() {
    const initial = loadSettings();
    const [isYearly, setIsYearlyState] = useState(initial.isYearly);
    const [shouldShowSmallDimes, setShouldShowSmallDimesState] = useState(
        initial.shouldShowSmallDimes,
    );
    const [shouldShowBigBucks, setShouldShowBigBucksState] = useState(
        initial.shouldShowBigBucks,
    );
    const [selectedYear, setSelectedYearState] = useState(initial.selectedYear);
    const [selectedMonth, setSelectedMonthState] = useState(
        initial.selectedMonth,
    );

    function persist(patch: Partial<SummaryViewSettings>) {
        saveSettings({
            isYearly,
            shouldShowSmallDimes,
            shouldShowBigBucks,
            selectedYear,
            selectedMonth,
            ...patch,
        });
    }

    function setIsYearly(value: boolean) {
        setIsYearlyState(value);
        persist({ isYearly: value });
    }

    function setShouldShowSmallDimes(value: boolean) {
        setShouldShowSmallDimesState(value);
        persist({ shouldShowSmallDimes: value });
    }

    function setShouldShowBigBucks(value: boolean) {
        setShouldShowBigBucksState(value);
        persist({ shouldShowBigBucks: value });
    }

    function setSelectedYear(value: number) {
        setSelectedYearState(value);
        persist({ selectedYear: value });
    }

    function setSelectedMonth(value: number) {
        setSelectedMonthState(value);
        persist({ selectedMonth: value });
    }

    return {
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
    };
}
