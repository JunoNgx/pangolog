"use client";

import { Button, Checkbox } from "@heroui/react";
import { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useSync } from "@/lib/hooks/useSync";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { getTimeFormatOptions } from "@/lib/utils";

const OfflineIndicator = dynamic(
    () =>
        import("@/components/OfflineIndicator").then((m) => m.OfflineIndicator),
    { ssr: false },
);

export function DriveSyncSection() {
    const { authToken, isConnected, isConnecting, error, connect, disconnect } =
        useGoogleAuth();
    const { sync } = useSync();
    const { syncStatus, lastSyncTime, syncError } = useLocalSyncDataStore();
    const { timeFormat, isAutobackupEnabled, setIsAutobackupEnabled } =
        useLocalUserSettingsStore();

    return (
        <section>
            <h3 className="text-lg font-semibold mb-4">Google Drive Sync</h3>
            <div className="flex flex-col gap-3">
                {lastSyncTime && (
                    <p className="text-xs text-default-400">
                        Last synced:{" "}
                        {DateTime.fromISO(lastSyncTime).toLocaleString({
                            ...DateTime.DATETIME_MED,
                            ...getTimeFormatOptions(timeFormat),
                        })}
                    </p>
                )}
                <OfflineIndicator
                    variant="banner"
                    isSuppressedWhenDisconnected
                />
                {isConnected ? (
                    <>
                        <p className="text-sm text-success-500">
                            Status: Connected as {authToken?.email}
                        </p>
                        <p className="text-xs text-default-400">
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
                ) : (
                    <>
                        <p className="text-sm text-default-400">
                            Status: Not connected
                        </p>
                        <Button
                            color="primary"
                            variant="flat"
                            className="self-start"
                            isLoading={isConnecting}
                            onPress={connect}
                        >
                            Connect Google Drive
                        </Button>
                        <p className="text-xs text-default-400">
                            Your email address is requested solely to display
                            which account is connected. This is never sent
                            anywhere.
                        </p>
                    </>
                )}
                {error && <p className="text-xs text-danger-500">{error}</p>}
                <Checkbox
                    isSelected={isAutobackupEnabled}
                    onValueChange={setIsAutobackupEnabled}
                    isDisabled={!isConnected}
                    size="sm"
                >
                    <span className="text-sm">Monthly autobackup</span>
                </Checkbox>
                {!isConnected && (
                    <p className="text-xs text-default-400">
                        Connect Google Drive to enable autobackup.
                    </p>
                )}
                <p className="text-xs text-default-400">
                    A backup is written to your Pangolog Drive folder each month
                    (backup-YYYY-MM.json) in the same format as the JSON export
                    below. Backups accumulate over time - clean up old ones
                    manually as needed.
                </p>
            </div>
        </section>
    );
}
