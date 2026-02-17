import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LogStore {
    isViewingBigBucks: boolean;
    shouldIncludeBucksInDimes: boolean;
    selectedYear: number;
    selectedMonth: number;
    setIsViewingBigBucks: (value: boolean) => void;
    setShouldIncludeBucksInDimes: (value: boolean) => void;
    setSelectedYear: (year: number) => void;
    setSelectedMonth: (month: number) => void;
}

const now = new Date();

export const useLogStore = create<LogStore>()(
    persist(
        (set) => ({
            isViewingBigBucks: false,
            shouldIncludeBucksInDimes: false,
            selectedYear: now.getFullYear(),
            selectedMonth: now.getMonth() + 1,
            setIsViewingBigBucks: (value) => set({ isViewingBigBucks: value }),
            setShouldIncludeBucksInDimes: (value) =>
                set({ shouldIncludeBucksInDimes: value }),
            setSelectedYear: (year) => set({ selectedYear: year }),
            setSelectedMonth: (month) => set({ selectedMonth: month }),
        }),
        { name: "pangolog-log" },
    ),
);
