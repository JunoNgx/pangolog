"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { TokenResult } from "@/lib/auth/types";
import { getOrCreatePangoFolder } from "@/lib/drive/client";
import { syncAll } from "@/lib/drive/sync";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { useGoogleAuth } from "./useGoogleAuth";
import { useLogger } from "./useLogger";

const DEBOUNCE_MS = 30_000;
const RESTORE_SYNC_THRESHOLD_MS = 24 * 60 * 60 * 1000;

// Module-level flag prevents concurrent syncs across hook instances.
let isSyncing = false;

function isExpiredResult(result: TokenResult): result is { expired: string } {
    return typeof result === "object" && result !== null;
}

function isAuthError(err: unknown): boolean {
    return err instanceof Error && err.message.includes("401");
}

function isScopeError(err: unknown): boolean {
    return (
        err instanceof Error &&
        err.message.includes("403") &&
        err.message.includes("insufficientPermissions")
    );
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
    const { addLoggerEntry } = useLogger();
    const queryClient = useQueryClient();

    const handleAuthExpired = useCallback(
        (logMessage: string, logcode: string, toastMessage: string) => {
            addLoggerEntry(logMessage, logcode);
            if (navigator.onLine) setAuthToken(null);
            toast.error(toastMessage, {
                id: "auth-reconnect",
                duration: Infinity,
            });
        },
        [addLoggerEntry, setAuthToken],
    );

    const sync = useCallback(
        async (isSilent = false) => {
            if (isSyncing) return;
            isSyncing = true;

            const tokenResult = await getValidToken();
            if (isExpiredResult(tokenResult)) {
                handleAuthExpired(
                    `Session expired before sync: ${tokenResult.expired}`,
                    "SYNC_AUTH_PRE_SYNC",
                    "Google Drive session expired (pre-sync). Please reconnect in Settings.",
                );
                isSyncing = false;
                return;
            }
            if (!tokenResult) {
                isSyncing = false;
                return;
            }
            const token = tokenResult;

            setSyncStatus("syncing");
            setSyncError(null);

            try {
                let folderId = driveFolderId;
                if (!folderId) {
                    folderId = await getOrCreatePangoFolder(token);
                    setDriveFolderId(folderId);
                }

                const syncStartTime = await syncAll(token, folderId);
                await queryClient.invalidateQueries();

                setSyncStatus("idle");
                setLastSyncTime(syncStartTime);
                toast.dismiss("auth-reconnect");
                if (!isSilent) {
                    toast.success("Sync complete");
                }
            } catch (err) {
                if (isScopeError(err)) {
                    setSyncStatus("idle");
                    toast.error(
                        "Google Drive access was revoked or has insufficient permissions. Please reconnect in Settings.",
                        { id: "auth-reconnect", duration: Infinity },
                    );
                    return;
                }

                if (!isAuthError(err)) {
                    const message =
                        err instanceof Error ? err.message : "Sync failed.";
                    setSyncStatus("error");
                    setSyncError(message);
                    toast.error(`Sync failed: ${message}`);
                    return;
                }

                // Drive returned 401 - attempt a silent token refresh.
                // Recovers from clock-skew expiry without user interaction.
                // The refreshed token will be picked up by the next sync.
                const refreshResult = await getValidToken(true);
                if (isExpiredResult(refreshResult)) {
                    setSyncStatus("idle");
                    handleAuthExpired(
                        `Session expired, token refresh failed: ${refreshResult.expired}`,
                        "SYNC_AUTH_REFRESH_FAILED",
                        "Google Drive session expired (token refresh failed). Please reconnect in Settings.",
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
            handleAuthExpired,
        ],
    );

    return { sync };
}

function isSyncStale(lastSyncTime: string | null): boolean {
    if (!lastSyncTime) return true;
    return (
        Date.now() - new Date(lastSyncTime).getTime() >
        RESTORE_SYNC_THRESHOLD_MS
    );
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

    // Flush pending debounce on hide; sync on restore if last sync was stale
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                // Discard pending debounce - restore sync will catch up on return
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                }
                return;
            }
            const { lastSyncTime } = useLocalSettingsStore.getState();
            if (isSyncStale(lastSyncTime)) sync(true);
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
