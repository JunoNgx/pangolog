import { DateTime } from "luxon";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViewDisplayMode } from "./useLogViewSettingsStore";

interface SummaryViewSettingsStore {
    isYearly: boolean;
    setIsYearly: (value: boolean) => void;
    selectedYear: number;
    setSelectedYear: (value: number) => void;
    selectedMonth: number;
    setSelectedMonth: (value: number) => void;
    summaryViewDisplayMode: ViewDisplayMode;
    setSummaryViewDisplayMode: (mode: ViewDisplayMode) => void;
}

export const useSummaryViewSettingsStore = create<SummaryViewSettingsStore>()(
    persist(
        (set) => ({
            isYearly: false,
            setIsYearly: (value) => set({ isYearly: value }),
            selectedYear: DateTime.now().year,
            setSelectedYear: (value) => set({ selectedYear: value }),
            selectedMonth: DateTime.now().month,
            setSelectedMonth: (value) => set({ selectedMonth: value }),
            summaryViewDisplayMode: "dimes" as ViewDisplayMode,
            setSummaryViewDisplayMode: (mode) =>
                set({ summaryViewDisplayMode: mode }),
        }),
        {
            name: "pangolog-summary-view-settings",
        },
    ),
);
