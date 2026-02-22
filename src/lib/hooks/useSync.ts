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
        setAuthToken,
    } = useLocalSettingsStore();
    const { getValidToken } = useGoogleAuth();
    const queryClient = useQueryClient();

    const sync = useCallback(
        async (silent = false) => {
            if (isSyncing) return;
            isSyncing = true;

            const token = await getValidToken();
            if (!token) {
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
                if (!silent) toast.success("Sync complete");
            } catch (err) {
                if (isAuthError(err)) {
                    // Force a GIS refresh regardless of local token validity -
                    // the 401 means the token is actually expired (e.g. clock skew).
                    const freshToken = await getValidToken(true);
                    if (!freshToken) {
                        // Silent refresh failed (e.g. mobile PWA WebView limitation).
                        // Stay connected and silently skip - next sync will retry.
                        setSyncStatus("idle");
                        return;
                    }
                    try {
                        const retryFolderId =
                            driveFolderId ??
                            (await getOrCreatePangoFolder(freshToken));
                        await syncAll(freshToken, retryFolderId);
                        await queryClient.invalidateQueries();
                        setSyncStatus("idle");
                        setLastSyncTime(new Date().toISOString());
                        if (!silent) toast.success("Sync complete");
                        return;
                    } catch {
                        // Fresh token was still rejected - genuine revocation.
                    }
                    setAuthToken(null);
                    setSyncStatus("error");
                    setSyncError(
                        "Session expired. Please reconnect Google Drive.",
                    );
                    toast.error(
                        "Google Drive session expired. Please reconnect in Settings.",
                        { duration: Infinity },
                    );
                    return;
                }
                const message =
                    err instanceof Error ? err.message : "Sync failed.";
                setSyncStatus("error");
                setSyncError(message);
                toast.error(`Sync failed: ${message}`, { duration: Infinity });
            } finally {
                isSyncing = false;
            }
        },
        [
            driveFolderId,
            getValidToken,
            queryClient,
            setAuthToken,
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
