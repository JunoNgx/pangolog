"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { purgeSeedData } from "@/lib/db/seed";
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

    const seedResolverRef = useRef<((carryOver: boolean) => void) | null>(null);
    const [isAwaitingSeedDecision, setIsAwaitingSeedDecision] = useState(false);

    const resolveSeedDecision = useCallback((carryOver: boolean) => {
        seedResolverRef.current?.(carryOver);
    }, []);

    const sync = useCallback(
        async (options?: { skipSeedPrompt?: boolean }) => {
            if (isSyncingRef.current) return;
            isSyncingRef.current = true;

            const token = await getValidToken();
            if (!token) {
                isSyncingRef.current = false;
                return;
            }

            const { seedIds, setSeedIds } = useLocalSettingsStore.getState();
            if (seedIds) {
                if (options?.skipSeedPrompt) {
                    isSyncingRef.current = false;
                    return;
                }
                if (seedResolverRef.current !== null) {
                    isSyncingRef.current = false;
                    return;
                }

                const carryOver = await new Promise<boolean>((resolve) => {
                    seedResolverRef.current = resolve;
                    setIsAwaitingSeedDecision(true);
                });

                setIsAwaitingSeedDecision(false);
                seedResolverRef.current = null;

                // Yield to let React flush the dialog close before continuing
                await Promise.resolve();

                if (carryOver) {
                    setSeedIds(null);
                } else {
                    await purgeSeedData();
                    await queryClient.invalidateQueries();
                }
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

    // Immediate sync on tab hide — skip seed prompt (user can't interact)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState !== "hidden") return;
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            sync({ skipSeedPrompt: true });
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
    }, [sync]);

    return { sync, isAwaitingSeedDecision, resolveSeedDecision };
}
