import { DateTime } from "luxon";
import { useEffect, useState } from "react";

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
    const [isYearly, setIsYearlyState] = useState(false);
    const [shouldShowSmallDimes, setShouldShowSmallDimesState] = useState(true);
    const [shouldShowBigBucks, setShouldShowBigBucksState] = useState(false);
    const [selectedYear, setSelectedYearState] = useState(
        DEFAULT_SETTINGS.selectedYear,
    );
    const [selectedMonth, setSelectedMonthState] = useState(
        DEFAULT_SETTINGS.selectedMonth,
    );

    useEffect(() => {
        const settings = loadSettings();
        setIsYearlyState(settings.isYearly);
        setShouldShowSmallDimesState(settings.shouldShowSmallDimes);
        setShouldShowBigBucksState(settings.shouldShowBigBucks);
        setSelectedYearState(settings.selectedYear);
        setSelectedMonthState(settings.selectedMonth);
    }, []);

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
