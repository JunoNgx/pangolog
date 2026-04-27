import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LogViewDisplayMode = "dimes" | "bucks" | "both";

interface LogViewSettingsStore {
    logViewDisplayMode: LogViewDisplayMode;
    setLogViewDisplayMode: (mode: LogViewDisplayMode) => void;
}

export const useLogViewSettingsStore = create<LogViewSettingsStore>()(
    persist(
        (set) => ({
            logViewDisplayMode: "dimes" as LogViewDisplayMode,
            setLogViewDisplayMode: (mode) => set({ logViewDisplayMode: mode }),
        }),
        {
            name: "pangolog-log-view-settings",
        },
    ),
);
