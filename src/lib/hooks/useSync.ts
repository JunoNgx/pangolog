"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { getOrCreatePangoFolder } from "@/lib/drive/client";
import { syncAll } from "@/lib/drive/sync";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { useGoogleAuth } from "./useGoogleAuth";

const DEBOUNCE_MS = 30_000;

export function useSync() {
    const {
        driveFolderId,
        setDriveFolderId,
        setSyncStatus,
        setLastSyncTime,
        setSyncError,
    } = useLocalSettingsStore();
    const { getValidToken } = useGoogleAuth();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSyncingRef = useRef(false);
    const queryClient = useQueryClient();

    const sync = useCallback(async () => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;

        const token = await getValidToken();
        if (!token) {
            isSyncingRef.current = false;
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
        } catch (err) {
            setSyncStatus("error");
            setSyncError(
                err instanceof Error ? err.message : "Sync failed.",
            );
        } finally {
            isSyncingRef.current = false;
        }
    }, [
        driveFolderId,
        getValidToken,
        queryClient,
        setDriveFolderId,
        setLastSyncTime,
        setSyncError,
        setSyncStatus,
    ]);

    const debouncedSync = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(sync, DEBOUNCE_MS);
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
            sync();
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
