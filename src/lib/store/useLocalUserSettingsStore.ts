import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectSystemTimeFormat } from "@/lib/utils";
import { PERSIST_LOCAL_USER } from "@/lib/constants";
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
            name: PERSIST_LOCAL_USER,
            partialize: (state) => ({
                timeFormat: state.timeFormat,
                isAutobackupEnabled: state.isAutobackupEnabled,
            }),
        },
    ),
);
