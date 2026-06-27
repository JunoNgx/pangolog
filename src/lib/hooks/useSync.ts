"use client";

import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { DEBOUNCE_MS, RESTORE_SYNC_THRESHOLD_MS } from "@/lib/constants";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { runFullSync } from "@/lib/sync/syncEngine";
import type { SyncTokenResult } from "@/lib/sync/syncProviderTypes";
import { useSyncProvider } from "@/lib/sync/useSyncProvider";

// Module-level flag prevents concurrent syncs across hook instances.
let isSyncing = false;
let authReconnectToastKey: string | null = null;

function isExpiredResult(
    result: SyncTokenResult,
): result is { expired: string } {
    return typeof result === "object" && result !== null;
}

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
    } = useLocalSyncDataStore();

    const { provider, getValidToken } = useSyncProvider();
    const queryClient = useQueryClient();

    const handleAuthExpired = useCallback(
        (message: string) => {
            if (navigator.onLine) setAuthToken(null);
            authReconnectToastKey = toast.danger(message, {
                timeout: 0,
            });
        },
        [setAuthToken],
    );

    const sync = useCallback(
        async (isSilent = false) => {
            if (isSyncing) return;
            isSyncing = true;

            const tokenResult = await getValidToken();
            if (isExpiredResult(tokenResult)) {
                handleAuthExpired(tokenResult.expired);
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
                    folderId = await provider.getOrCreateRoot(token);
                    setDriveFolderId(folderId);
                }

                const syncStartTime = await runFullSync(
                    token,
                    folderId,
                    provider,
                );
                await queryClient.invalidateQueries();

                setSyncStatus("idle");
                setLastSyncTime(syncStartTime);
                if (authReconnectToastKey) {
                    toast.close(authReconnectToastKey);
                    authReconnectToastKey = null;
                }
                if (!isSilent) {
                    toast.success("Sync complete");
                }
            } catch (err) {
                if (provider.isScopeError(err)) {
                    setSyncStatus("idle");
                    authReconnectToastKey = toast.danger(
                        provider.revokedMessage,
                        { timeout: 0 },
                    );
                    return;
                }

                if (!isAuthError(err)) {
                    const message =
                        err instanceof Error ? err.message : "Sync failed.";
                    setSyncStatus("error");
                    setSyncError(message);
                    toast.danger(`Sync failed: ${message}`);
                    return;
                }

                const refreshResult = await getValidToken(true);
                if (isExpiredResult(refreshResult)) {
                    setSyncStatus("idle");
                    handleAuthExpired(refreshResult.expired);
                    return;
                }

                setSyncStatus("idle");
            } finally {
                isSyncing = false;
            }
        },
        [
            driveFolderId,
            provider,
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
            const { lastSyncTime } = useLocalSyncDataStore.getState();
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
