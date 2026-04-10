import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectSystemTimeFormat } from "@/lib/utils";

interface LocalUserSettingsStore {
    timeFormat: "12h" | "24h";
    setTimeFormat: (format: "12h" | "24h") => void;
    isAutobackupEnabled: boolean;
    setIsAutobackupEnabled: (enabled: boolean) => void;
}

export const useLocalUserSettingsStore = create<LocalUserSettingsStore>()(
    persist(
        (set) => ({
            timeFormat: detectSystemTimeFormat(),
            setTimeFormat: (format) => set({ timeFormat: format }),
            isAutobackupEnabled: false,
            setIsAutobackupEnabled: (enabled) =>
                set({ isAutobackupEnabled: enabled }),
        }),
        {
            name: "pangolog-local-user-settings",
            partialize: (state) => ({
                timeFormat: state.timeFormat,
                isAutobackupEnabled: state.isAutobackupEnabled,
            }),
        },
    ),
);
