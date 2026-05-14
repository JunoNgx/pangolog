import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewDisplayMode = "dimes" | "bucks" | "all";

interface LogViewSettingsStore {
    logViewDisplayMode: ViewDisplayMode;
    setLogViewDisplayMode: (mode: ViewDisplayMode) => void;
}

export const useLogViewSettingsStore = create<LogViewSettingsStore>()(
    persist(
        (set) => ({
            logViewDisplayMode: "dimes" as ViewDisplayMode,
            setLogViewDisplayMode: (mode) => set({ logViewDisplayMode: mode }),
        }),
        {
            name: "pangolog-log-view-settings",
        },
    ),
);
