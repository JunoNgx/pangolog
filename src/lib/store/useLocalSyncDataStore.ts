import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PERSIST_LOCAL_SYNC } from "@/lib/constants";
import type { SyncAuthToken } from "@/lib/sync/syncProviderTypes";

export type SyncStatus = "idle" | "syncing" | "error";

interface LocalSyncDataStore {
    authToken: SyncAuthToken | null;
    setAuthToken: (token: SyncAuthToken | null) => void;
    driveFolderId: string | null;
    setDriveFolderId: (id: string | null) => void;
    lastSyncTime: string | null;
    setLastSyncTime: (time: string | null) => void;
    syncStatus: SyncStatus;
    setSyncStatus: (status: SyncStatus) => void;
    syncError: string | null;
    setSyncError: (error: string | null) => void;
    hasHydrated: boolean;
}

export const useLocalSyncDataStore = create<LocalSyncDataStore>()(
    persist(
        (set) => ({
            authToken: null,
            setAuthToken: (token) => set({ authToken: token }),
            driveFolderId: null,
            setDriveFolderId: (id) => set({ driveFolderId: id }),
            lastSyncTime: null,
            setLastSyncTime: (time) => set({ lastSyncTime: time }),
            syncStatus: "idle",
            setSyncStatus: (status) => set({ syncStatus: status }),
            syncError: null,
            setSyncError: (error) => set({ syncError: error }),
            hasHydrated: false,
        }),
        {
            name: PERSIST_LOCAL_SYNC,
            partialize: (state) => ({
                authToken: state.authToken,
                driveFolderId: state.driveFolderId,
                lastSyncTime: state.lastSyncTime,
            }),
            onRehydrateStorage: () => () => {
                useLocalSyncDataStore.setState({ hasHydrated: true });
            },
        },
    ),
);
