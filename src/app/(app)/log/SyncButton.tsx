"use client";

import { Button, Tooltip } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { DateTime } from "luxon";
import { toast } from "sonner";
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

    const iconClass = `
        shrink-0
        ${syncStatus === "idle" ? "text-success" : ""}
        ${syncStatus === "syncing" ? "text-accent animate-spin" : ""}
        ${syncStatus === "error" ? "text-danger" : ""}
    `;

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
                variant="secondary"
                isDisabled={syncStatus === "syncing"}
                onPress={handleSync}
                aria-label="Sync with Google Drive"
                className="text-muted flex h-7 min-w-0 items-center gap-1.5 px-2"
            >
                <RefreshCw size={12} className={iconClass} aria-hidden="true" />
                <span
                    aria-live="polite"
                    aria-atomic="true"
                    className="text-xs font-normal"
                >
                    {statusLabel}
                </span>
            </Button>
            <Tooltip.Content placement="bottom">Ctrl/Cmd + S</Tooltip.Content>
        </Tooltip>
    );
}
