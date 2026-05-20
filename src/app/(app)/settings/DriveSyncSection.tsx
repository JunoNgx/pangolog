"use client";

import { Button, Checkbox } from "@heroui/react";
import { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { useSync } from "@/lib/hooks/useSync";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useSyncProvider } from "@/lib/sync/useSyncProvider";
import { getTimeFormatOptions } from "@/lib/utils";

const OfflineIndicator = dynamic(
    () =>
        import("@/components/OfflineIndicator").then((m) => m.OfflineIndicator),
    { ssr: false },
);

export function DriveSyncSection() {
    const { authToken, isConnected, isConnecting, error, connect, disconnect } =
        useSyncProvider();
    const { sync } = useSync();
    const { syncStatus, lastSyncTime, syncError } = useLocalSyncDataStore();
    const { timeFormat, isAutobackupEnabled, setIsAutobackupEnabled } =
        useLocalUserSettingsStore();

    const lastSyncRow = lastSyncTime && (
        <p className="text-default-400 text-xs">
            Last synced:{" "}
            {DateTime.fromISO(lastSyncTime).toLocaleString({
                ...DateTime.DATETIME_MED,
                ...getTimeFormatOptions(timeFormat),
            })}
        </p>
    );

    const errorRow = error && (
        <p className="text-danger-500 text-xs">{error}</p>
    );

    const autobackupDisabledInfo = !isConnected && (
        <p className="text-default-400 text-xs">
            Connect Google Drive to enable autobackup.
        </p>
    );

    const connectedContent = (
        <>
            <p className="text-success-500 text-sm">
                Status: Connected as {authToken?.email}
            </p>
            <p className="text-default-400 text-xs">
                {syncStatus === "syncing" && "Syncing..."}
                {syncStatus === "error" && `Error: ${syncError}`}
            </p>
            <div className="flex gap-2">
                <Button
                    color="danger"
                    variant="flat"
                    className="max-w-xs"
                    onPress={disconnect}
                >
                    Disconnect
                </Button>
                <Button
                    color="primary"
                    variant="flat"
                    className="max-w-xs"
                    isLoading={syncStatus === "syncing"}
                    onPress={() => sync()}
                >
                    Sync now
                </Button>
            </div>
        </>
    );

    const disconnectedContent = (
        <>
            <p className="text-default-400 text-sm">Status: Not connected</p>
            <Button
                color="primary"
                variant="flat"
                className="self-start"
                isLoading={isConnecting}
                onPress={connect}
            >
                Connect Google Drive
            </Button>
            <p className="text-default-400 text-xs">
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
            <h3 className="mb-4 text-lg font-semibold">Google Drive Sync</h3>
            <div className="flex flex-col gap-3">
                {lastSyncRow}
                <OfflineIndicator
                    variant="banner"
                    isSuppressedWhenDisconnected
                />
                {syncStatusContent}
                {errorRow}
                <Checkbox
                    isSelected={isAutobackupEnabled}
                    onValueChange={setIsAutobackupEnabled}
                    isDisabled={!isConnected}
                    size="sm"
                >
                    <span className="text-sm">Monthly autobackup</span>
                </Checkbox>
                {autobackupDisabledInfo}
                <p className="text-default-400 text-xs">
                    A backup is written to your Pangolog Drive folder each month
                    (backup-YYYY-MM.json) in the same format as the JSON export
                    below. Backups accumulate over time - clean up old ones
                    manually as needed.
                </p>
            </div>
        </section>
    );
}
