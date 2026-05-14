import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectSystemTimeFormat } from "@/lib/utils";
import type { TimeFormat } from "@/lib/types";

interface LocalUserSettingsStore {
    timeFormat: TimeFormat;
    setTimeFormat: (format: TimeFormat) => void;
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
