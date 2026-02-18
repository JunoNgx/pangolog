import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocalSettingsStore {
    hasUsedBefore: boolean;
    setHasUsedBefore: (value: boolean) => void;
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
    persist(
        (set) => ({
            hasUsedBefore: false,
            setHasUsedBefore: (value) => set({ hasUsedBefore: value }),
        }),
        {
            name: "pangolog-local-settings",
        },
    ),
);
