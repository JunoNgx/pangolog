"use client";

import { Button, Tooltip } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { DateTime } from "luxon";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useSyncFn } from "@/lib/hooks/useSync";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

export function SyncButton() {
    const { isConnected } = useGoogleAuth();
    const { syncStatus, syncError, lastSyncTime } = useLocalSettingsStore();
    const { timeFormat } = useProfileSettingsStore();
    const { sync } = useSyncFn();

    if (!isConnected) return null;

    const iconClass = `
        shrink-0
        ${syncStatus === "idle" ? "text-success-500" : ""}
        ${syncStatus === "syncing" ? "text-primary-500 animate-spin" : ""}
        ${syncStatus === "error" ? "text-danger-500" : ""}
    `;

    const lastSyncDt = lastSyncTime ? DateTime.fromISO(lastSyncTime) : null;
    const isWithin24Hours = lastSyncDt
        ? lastSyncDt.diffNow("hours").hours > -24
        : false;
    const timeFormatOptions =
        timeFormat === "24h" ? DateTime.TIME_24_SIMPLE : DateTime.TIME_SIMPLE;
    const lastSyncLabel = lastSyncDt
        ? isWithin24Hours
            ? lastSyncDt.toLocaleString(timeFormatOptions)
            : lastSyncDt.toRelative()
        : "Never";

    const statusLabel =
        syncStatus === "error" && syncError
            ? `Error: ${syncError}`
            : syncStatus === "syncing"
              ? "Syncing..."
              : `Synced ${lastSyncLabel}`;

    return (
        <Tooltip content="Cmd + S" placement="bottom">
            <Button
                size="sm"
                variant="flat"
                isDisabled={syncStatus === "syncing"}
                onPress={() => sync()}
                className="flex items-center gap-1.5 px-2 h-7 min-w-0 text-default-500"
            >
                <RefreshCw size={12} className={iconClass} />
                <span className="text-xs font-normal">{statusLabel}</span>
            </Button>
        </Tooltip>
    );
}
