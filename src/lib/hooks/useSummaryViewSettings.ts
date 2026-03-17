import { DateTime } from "luxon";
import { useEffect, useState } from "react";

const STORAGE_KEY = "pangolog-summary-view-settings";

interface SummaryViewSettings {
    isYearly: boolean;
    isViewingBucksOnly: boolean;
    shouldIncludeBucks: boolean;
    selectedYear: number;
    selectedMonth: number;
}

const DEFAULT_SETTINGS: SummaryViewSettings = {
    isYearly: false,
    isViewingBucksOnly: false,
    shouldIncludeBucks: false,
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
    const [isViewingBucksOnly, setIsViewingBucksOnlyState] = useState(false);
    const [shouldIncludeBucks, setShouldIncludeBucksState] = useState(false);
    const [selectedYear, setSelectedYearState] = useState(
        DEFAULT_SETTINGS.selectedYear,
    );
    const [selectedMonth, setSelectedMonthState] = useState(
        DEFAULT_SETTINGS.selectedMonth,
    );

    useEffect(() => {
        const settings = loadSettings();
        setIsYearlyState(settings.isYearly);
        setIsViewingBucksOnlyState(settings.isViewingBucksOnly);
        setShouldIncludeBucksState(settings.shouldIncludeBucks);
        setSelectedYearState(settings.selectedYear);
        setSelectedMonthState(settings.selectedMonth);
    }, []);

    function persist(patch: Partial<SummaryViewSettings>) {
        saveSettings({
            isYearly,
            isViewingBucksOnly,
            shouldIncludeBucks,
            selectedYear,
            selectedMonth,
            ...patch,
        });
    }

    function setIsYearly(value: boolean) {
        setIsYearlyState(value);
        persist({ isYearly: value });
    }

    function setIsViewingBucksOnly(value: boolean) {
        setIsViewingBucksOnlyState(value);
        persist({ isViewingBucksOnly: value });
    }

    function setShouldIncludeBucks(value: boolean) {
        setShouldIncludeBucksState(value);
        persist({ shouldIncludeBucks: value });
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
        isViewingBucksOnly,
        setIsViewingBucksOnly,
        shouldIncludeBucks,
        setShouldIncludeBucks,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
    };
}
