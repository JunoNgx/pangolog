"use client";

import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";

const STATUS_LABEL = {
    idle: "Synced",
    syncing: "Syncing...",
    error: "Sync error",
} as const;

export function SyncStatusDot() {
    const { isConnected } = useGoogleAuth();
    const { syncStatus, syncError } = useLocalSettingsStore();

    if (!isConnected) return null;

    const dotClass = `
        size-2 rounded-full
        ${syncStatus === "idle" ? "bg-success-500" : ""}
        ${syncStatus === "syncing" ? "bg-primary-500 animate-pulse" : ""}
        ${syncStatus === "error" ? "bg-danger-500" : ""}
    `;

    const title =
        syncStatus === "error" && syncError
            ? `Sync error: ${syncError}`
            : STATUS_LABEL[syncStatus];

    return (
        <div title={title} className="flex items-center">
            <span className={dotClass} />
        </div>
    );
}
