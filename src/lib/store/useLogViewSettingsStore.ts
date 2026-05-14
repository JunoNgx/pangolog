import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PERSIST_LOG_VIEW } from "@/lib/constants";
import type { ViewDisplayMode } from "@/lib/types";

interface LogViewSettingsStore {
    logViewDisplayMode: ViewDisplayMode;
    setLogViewDisplayMode: (mode: ViewDisplayMode) => void;
}

export const useLogViewSettingsStore = create<LogViewSettingsStore>()(
    persist(
        (set) => ({
            logViewDisplayMode: "dimes",
            setLogViewDisplayMode: (mode) => set({ logViewDisplayMode: mode }),
        }),
        {
            name: PERSIST_LOG_VIEW,
        },
    ),
);
