import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthToken } from "@/lib/auth/types";
import { detectSystemTimeFormat } from "@/lib/utils";

export type SyncStatus = "idle" | "syncing" | "error";
export type LoggerEntry = {
    timestamp: string;
    message: string;
    logcode?: string;
    data?: any;
};

interface LocalSettingsStore {
    authToken: AuthToken | null;
    setAuthToken: (token: AuthToken | null) => void;
    driveFolderId: string | null;
    setDriveFolderId: (id: string | null) => void;
    lastSyncTime: string | null;
    setLastSyncTime: (time: string | null) => void;
    isAutobackupEnabled: boolean;
    setIsAutobackupEnabled: (enabled: boolean) => void;
    timeFormat: "12h" | "24h";
    setTimeFormat: (format: "12h" | "24h") => void;
    shouldShowDemoDataBanner: boolean;
    setShouldShowDemoDataBanner: (show: boolean) => void;
    syncStatus: SyncStatus;
    setSyncStatus: (status: SyncStatus) => void;
    syncError: string | null;
    setSyncError: (error: string | null) => void;
    hasHydrated: boolean;
    loggerEntries: LoggerEntry[];
    setLoggerEntries: (entries: LoggerEntry[]) => void;
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
    persist(
        (set) => ({
            authToken: null,
            setAuthToken: (token) => set({ authToken: token }),
            driveFolderId: null,
            setDriveFolderId: (id) => set({ driveFolderId: id }),
            lastSyncTime: null,
            setLastSyncTime: (time) => set({ lastSyncTime: time }),
            isAutobackupEnabled: false,
            setIsAutobackupEnabled: (enabled) =>
                set({ isAutobackupEnabled: enabled }),
            timeFormat: detectSystemTimeFormat(),
            setTimeFormat: (format) => set({ timeFormat: format }),
            shouldShowDemoDataBanner: true,
            setShouldShowDemoDataBanner: (show) =>
                set({ shouldShowDemoDataBanner: show }),
            syncStatus: "idle",
            setSyncStatus: (status) => set({ syncStatus: status }),
            syncError: null,
            setSyncError: (error) => set({ syncError: error }),
            hasHydrated: false,
            loggerEntries: [],
            setLoggerEntries: (entries) => set({ loggerEntries: entries }),
        }),
        {
            name: "pangolog-local-settings",
            partialize: (state) => ({
                authToken: state.authToken,
                driveFolderId: state.driveFolderId,
                lastSyncTime: state.lastSyncTime,
                isAutobackupEnabled: state.isAutobackupEnabled,
                shouldShowDemoDataBanner: state.shouldShowDemoDataBanner,
                timeFormat: state.timeFormat,
            }),
            onRehydrateStorage: () => () => {
                useLocalSettingsStore.setState({ hasHydrated: true });
            },
        },
    ),
);
