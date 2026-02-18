import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LocalSettingsStore {
    hasUsedBefore: boolean;
    setHasUsedBefore: (value: boolean) => void;
    // isSyncEnabled: boolean;
    // lastSyncTime: string;
    // syncError: string,
    // setIsSyncEnabled: (value: boolean) => void;
    // setLastSyncTime: (value: string) => void;
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
    persist(
        (set) => ({
            hasUsedBefore: false,
            setHasUsedBefore: (value) => set({ hasUsedBefore: value}),
            // isSyncEnabled: false,
            // lastSyncTime: "",
            // syncError: "",
            // setIsSyncEnabled: (value) => set({ isSyncEnabled: value}),
            // setLastSyncTime: (value) => set({ lastSyncTime: value}),
        }),
        {
            name: "pangolog-local-settings",
            partialize: (state) => ({
                hasUsedBefore: state.hasUsedBefore,
            }),
        },
    ),
);
