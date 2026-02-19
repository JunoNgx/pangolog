import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SummaryStore {
    isYearly: boolean;
    isViewingBucksOnly: boolean;
    includeBucks: boolean;
    selectedYear: number;
    selectedMonth: number;
    setIsYearly: (value: boolean) => void;
    setIsViewingBucksOnly: (value: boolean) => void;
    setIncludeBucks: (value: boolean) => void;
    setSelectedYear: (year: number) => void;
    setSelectedMonth: (month: number) => void;
}

const now = new Date();

export const useSummaryStore = create<SummaryStore>()(
    persist(
        (set) => ({
            isYearly: false,
            isViewingBucksOnly: false,
            includeBucks: false,
            selectedYear: now.getFullYear(),
            selectedMonth: now.getMonth() + 1,
            setIsYearly: (value) => set({ isYearly: value }),
            setIsViewingBucksOnly: (value) =>
                set({ isViewingBucksOnly: value }),
            setIncludeBucks: (value) => set({ includeBucks: value }),
            setSelectedYear: (year) => set({ selectedYear: year }),
            setSelectedMonth: (month) => set({ selectedMonth: month }),
        }),
        { name: "pangolog-summary" },
    ),
);
