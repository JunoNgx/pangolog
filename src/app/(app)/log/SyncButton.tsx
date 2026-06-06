"use client";

import { Button, Tooltip, toast } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { DateTime } from "luxon";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { useSyncFn } from "@/lib/hooks/useSync";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useSyncProvider } from "@/lib/sync/useSyncProvider";
import { getTimeFormatOptions } from "@/lib/utils";

export function SyncButton() {
    const { isConnected } = useSyncProvider();
    const { syncStatus, syncError, lastSyncTime } = useLocalSyncDataStore();
    const { timeFormat } = useLocalUserSettingsStore();
    const { sync } = useSyncFn();
    const { isOnline } = useOnlineStatus();

    if (!isConnected) return null;

    function handleSync() {
        if (!isOnline) {
            toast.warning("You are offline.");
            return;
        }
        sync();
    }

    const lastSyncDt = lastSyncTime ? DateTime.fromISO(lastSyncTime) : null;
    const isWithin24Hours = lastSyncDt
        ? lastSyncDt.diffNow("hours").hours > -24
        : false;
    const lastSyncLabel = lastSyncDt
        ? isWithin24Hours
            ? lastSyncDt.toLocaleString(getTimeFormatOptions(timeFormat))
            : lastSyncDt.toRelative()
        : "Never";

    const statusLabel =
        syncStatus === "error" && syncError
            ? `Error: ${syncError}`
            : syncStatus === "syncing"
              ? "Syncing..."
              : `Synced ${lastSyncLabel}`;

    return (
        <Tooltip delay={0}>
            <Button
                size="sm"
                variant="outline"
                isDisabled={syncStatus === "syncing"}
                onPress={handleSync}
                aria-label="Sync with Google Drive"
            >
                <RefreshCw
                    size={12}
                    className={`shrink-0 ${syncStatus === "idle" ? "text-success" : ""} ${syncStatus === "syncing" ? "animate-spin text-blue-500" : ""} ${syncStatus === "error" ? "text-danger" : ""}`}
                    aria-hidden="true"
                />
                <span aria-live="polite" aria-atomic="true">
                    {statusLabel}
                </span>
            </Button>
            <Tooltip.Content placement="bottom">Ctrl/Cmd + S</Tooltip.Content>
        </Tooltip>
    );
}
