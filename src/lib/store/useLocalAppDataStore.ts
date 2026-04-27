import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LoggerEntry = {
    timestamp: string;
    message: string;
    logcode?: string;
    data?: unknown;
};

interface LocalAppDataStore {
    shouldShowDemoDataBanner: boolean;
    setShouldShowDemoDataBanner: (show: boolean) => void;
    hasHydrated: boolean;
    loggerEntries: LoggerEntry[];
    setLoggerEntries: (entries: LoggerEntry[]) => void;
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
        }),
        {
            name: "pangolog-local-app-data",
            partialize: (state) => ({
                shouldShowDemoDataBanner: state.shouldShowDemoDataBanner,
            }),
            onRehydrateStorage: () => () => {
                useLocalAppDataStore.setState({ hasHydrated: true });
            },
        },
    ),
);
