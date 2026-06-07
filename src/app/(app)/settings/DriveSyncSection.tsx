"use client";

import { Button, Checkbox, Label } from "@heroui/react";
import { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { useSync } from "@/lib/hooks/useSync";
import {
    type SyncStatus,
    useLocalSyncDataStore,
} from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useSyncProvider } from "@/lib/sync/useSyncProvider";
import { getTimeFormatOptions } from "@/lib/utils";

const OfflineIndicator = dynamic(
    () =>
        import("@/components/OfflineIndicator").then((m) => m.OfflineIndicator),
    { ssr: false },
);

function getSyncStatusText(
    status: SyncStatus,
    error: string | null,
): string | null {
    if (status === "syncing") {
        return "Syncing...";
    }
    if (status === "error") {
        return `Error: ${error}`;
    }
    return null;
}

export function DriveSyncSection() {
    const { authToken, isConnected, isConnecting, error, connect, disconnect } =
        useSyncProvider();
    const { sync } = useSync();
    const { syncStatus, lastSyncTime, syncError, hasHydrated } =
        useLocalSyncDataStore();
    const { timeFormat, isAutobackupEnabled, setIsAutobackupEnabled } =
        useLocalUserSettingsStore();

    const lastSyncRow = lastSyncTime && (
        <p className="text-muted text-xs">
            Last synced:{" "}
            {DateTime.fromISO(lastSyncTime).toLocaleString({
                ...DateTime.DATETIME_MED,
                ...getTimeFormatOptions(timeFormat),
            })}
        </p>
    );

    const errorRow = error && <p className="text-danger text-xs">{error}</p>;

    const autobackupDisabledInfo = !isConnected && (
        <p className="text-muted text-xs">
            Connect Google Drive to enable autobackup.
        </p>
    );

    const syncStatusText = getSyncStatusText(syncStatus, syncError);

    const connectedContent = (
        <>
            <p className="text-success text-sm">
                Status: Connected as {authToken?.email}
            </p>
            <div className="flex gap-2">
                <Button
                    variant="danger-soft"
                    className="max-w-xs"
                    onPress={disconnect}
                >
                    Disconnect
                </Button>
                <Button
                    variant="primary"
                    className="max-w-xs"
                    isPending={syncStatus === "syncing"}
                    onPress={() => sync()}
                >
                    Sync now
                </Button>
            </div>
            {syncStatusText && (
                <p className="text-muted text-xs">{syncStatusText}</p>
            )}
        </>
    );

    const disconnectedContent = (
        <>
            <p className="text-muted text-sm">Status: Not connected</p>
            <Button
                variant="primary"
                className="self-start"
                isPending={isConnecting}
                onPress={connect}
            >
                Connect Google Drive
            </Button>
            <p className="text-muted text-xs">
                Your email address is requested solely to display which account
                is connected. This is never sent anywhere.
            </p>
        </>
    );

    const syncStatusContent = isConnected
        ? connectedContent
        : disconnectedContent;

    return (
        <section>
            <h3 className="mb-2 text-lg font-semibold">Google Drive Sync</h3>
            <div className="flex flex-col gap-3">
                {lastSyncRow}
                <OfflineIndicator
                    variant="banner"
                    isSuppressedWhenDisconnected
                />
                {syncStatusContent}
                {errorRow}
                {hasHydrated && (
                    <>
                        <Checkbox
                            isSelected={isAutobackupEnabled}
                            onChange={setIsAutobackupEnabled}
                            isDisabled={!isConnected}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Content>
                                <Label>Monthly autobackup</Label>
                            </Checkbox.Content>
                        </Checkbox>
                        {autobackupDisabledInfo}
                    </>
                )}
                <p className="text-muted text-xs">
                    A backup is written to your Pangolog Drive folder each month
                    (backup-YYYY-MM.json) in the same format as the JSON export
                    below. Backups accumulate over time - clean up old ones
                    manually as needed.
                </p>
            </div>
        </section>
    );
}
