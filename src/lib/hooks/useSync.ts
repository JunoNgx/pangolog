"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getOrCreatePangoFolder } from "@/lib/drive/client";
import { syncAll } from "@/lib/drive/sync";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { useGoogleAuth } from "./useGoogleAuth";

const DEBOUNCE_MS = 30_000;

// Module-level flag prevents concurrent syncs across hook instances.
let isSyncing = false;

function isAuthError(err: unknown): boolean {
    return err instanceof Error && err.message.includes("401");
}

export function useSyncFn() {
    const {
        driveFolderId,
        setDriveFolderId,
        setSyncStatus,
        setLastSyncTime,
        setSyncError,
    } = useLocalSettingsStore();

    const { getValidToken } = useGoogleAuth();
    const queryClient = useQueryClient();

    const sync = useCallback(
        async (isSilent = false) => {
            if (isSyncing) return;
            isSyncing = true;

            const token = await getValidToken();
            if (!token) {
                if (useLocalSettingsStore.getState().authToken) {
                    toast.error(
                        "Google Drive session expired. Please reconnect in Settings.",
                        { id: "auth-reconnect", duration: Infinity },
                    );
                }
                isSyncing = false;
                return;
            }

            setSyncStatus("syncing");
            setSyncError(null);

            try {
                let folderId = driveFolderId;
                if (!folderId) {
                    folderId = await getOrCreatePangoFolder(token);
                    setDriveFolderId(folderId);
                }

                await syncAll(token, folderId);
                await queryClient.invalidateQueries();

                setSyncStatus("idle");
                setLastSyncTime(new Date().toISOString());
                toast.dismiss("auth-reconnect");
                if (!isSilent) {
                    toast.success("Sync complete");
                }
            } catch (err) {
                if (!isAuthError(err)) {
                    const message =
                        err instanceof Error ? err.message : "Sync failed.";
                    setSyncStatus("error");
                    setSyncError(message);
                    toast.error(`Sync failed: ${message}`, {
                        duration: Infinity,
                    });
                    return;
                }

                // Drive returned 401 - attempt a isSilent token refresh.
                // Recovers from clock-skew expiry without user interaction.
                // The refreshed token will be picked up by the next sync.
                const freshToken = await getValidToken(true);
                if (!freshToken) {
                    setSyncStatus("idle");
                    toast.error(
                        "Google Drive session expired. Please reconnect in Settings.",
                        { id: "auth-reconnect", duration: Infinity },
                    );
                    return;
                }

                setSyncStatus("idle");
            } finally {
                isSyncing = false;
            }
        },
        [
            driveFolderId,
            getValidToken,
            queryClient,
            setDriveFolderId,
            setLastSyncTime,
            setSyncError,
            setSyncStatus,
        ],
    );

    return { sync };
}

export function useSync() {
    const { sync } = useSyncFn();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryClient = useQueryClient();

    const debouncedSync = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => sync(true), DEBOUNCE_MS);
    }, [sync]);

    // Trigger debounced sync after any successful mutation
    useEffect(() => {
        return queryClient.getMutationCache().subscribe((event) => {
            if (event.mutation?.state.status === "success") {
                debouncedSync();
            }
        });
    }, [queryClient, debouncedSync]);

    // Immediate sync on tab hide
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState !== "hidden") return;
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            sync(true);
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
    }, [sync]);

    return { sync };
}
