import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LogStore {
    isViewingBigBucks: boolean;
    shouldIncludeBucksInDimes: boolean;
    selectedYear: number;
    selectedMonth: number;
    selectedCategoryIds: string[] | null;
    setIsViewingBigBucks: (value: boolean) => void;
    setShouldIncludeBucksInDimes: (value: boolean) => void;
    setSelectedYear: (year: number) => void;
    setSelectedMonth: (month: number) => void;
    setSelectedCategoryIds: (ids: string[] | null) => void;
}

const now = new Date();

export const useLogStore = create<LogStore>()(
    persist(
        (set) => ({
            isViewingBigBucks: false,
            shouldIncludeBucksInDimes: false,
            selectedYear: now.getFullYear(),
            selectedMonth: now.getMonth() + 1,
            selectedCategoryIds: null,
            setIsViewingBigBucks: (value) => set({ isViewingBigBucks: value }),
            setShouldIncludeBucksInDimes: (value) =>
                set({ shouldIncludeBucksInDimes: value }),
            setSelectedYear: (year) => set({ selectedYear: year }),
            setSelectedMonth: (month) => set({ selectedMonth: month }),
            setSelectedCategoryIds: (ids) => set({ selectedCategoryIds: ids }),
        }),
        { name: "pangolog-log" },
    ),
);
