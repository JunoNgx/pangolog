import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LogViewDisplayMode = "dimes" | "bucks" | "both";

export type LoggerEntry = {
    timestamp: string;
    message: string;
    logcode?: string;
    data?: any;
};

interface LocalAppDataStore {
    shouldShowDemoDataBanner: boolean;
    setShouldShowDemoDataBanner: (show: boolean) => void;
    hasHydrated: boolean;
    loggerEntries: LoggerEntry[];
    setLoggerEntries: (entries: LoggerEntry[]) => void;
    logViewDisplayMode: LogViewDisplayMode;
    setLogViewDisplayMode: (mode: LogViewDisplayMode) => void;
}

export const useLocalAppDataStore = create<LocalAppDataStore>()(
    persist(
        (set) => ({
            shouldShowDemoDataBanner: true,
            setShouldShowDemoDataBanner: (show) =>
                set({ shouldShowDemoDataBanner: show }),
            hasHydrated: false,
            loggerEntries: [],
            setLoggerEntries: (entries) => set({ loggerEntries: entries }),
            logViewDisplayMode: "dimes" as LogViewDisplayMode,
            setLogViewDisplayMode: (mode) => set({ logViewDisplayMode: mode }),
        }),
        {
            name: "pangolog-local-app-data",
            partialize: (state) => ({
                shouldShowDemoDataBanner: state.shouldShowDemoDataBanner,
                logViewDisplayMode: state.logViewDisplayMode,
            }),
            onRehydrateStorage: () => () => {
                useLocalAppDataStore.setState({ hasHydrated: true });
            },
        },
    ),
);
