"use client";

import { Button, Input, Radio, RadioGroup } from "@heroui/react";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useSync } from "@/lib/hooks/useSync";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

export default function SettingsPage() {
    const {
        customCurrency,
        isPrefixCurrency,
        setCustomCurrency,
        setIsPrefixCurrency,
    } = useProfileSettingsStore();
    const { authToken, isConnected, isConnecting, error, connect, disconnect } =
        useGoogleAuth();
    const { sync } = useSync();
    const { syncStatus, lastSyncTime, syncError } = useLocalSettingsStore();

    const previewAmount = "12.50";
    const preview = customCurrency
        ? isPrefixCurrency
            ? `${customCurrency}${previewAmount}`
            : `${previewAmount} ${customCurrency}`
        : previewAmount;

    return (
        <div>
            <h2 className="font-mono text-xl font-bold mb-6">Settings</h2>

            <section className="mb-8">
                <h3 className="font-mono text-lg font-semibold mb-4">
                    Display Currency
                </h3>
                <div className="flex flex-col gap-4">
                    <Input
                        label="Currency symbol"
                        placeholder="e.g. $, EUR, VND"
                        value={customCurrency}
                        onValueChange={setCustomCurrency}
                        className="max-w-xs"
                    />
                    <RadioGroup
                        label="Position"
                        orientation="horizontal"
                        value={isPrefixCurrency ? "prefix" : "suffix"}
                        onValueChange={(v) =>
                            setIsPrefixCurrency(v === "prefix")
                        }
                    >
                        <Radio value="prefix">Prefix ($12)</Radio>
                        <Radio value="suffix">Suffix (12 SGD)</Radio>
                    </RadioGroup>
                    <p className="font-mono text-sm text-default-500">
                        Preview: {preview}
                    </p>
                </div>
            </section>

            <section>
                <h3 className="font-mono text-lg font-semibold mb-4">
                    Google Drive Sync
                </h3>
                <div className="flex flex-col gap-3">
                    {isConnected ? (
                        <>
                            <p className="font-mono text-sm text-success-500">
                                Status: Connected as {authToken!.email}
                            </p>
                            <p className="font-mono text-xs text-default-400">
                                {syncStatus === "syncing" && "Syncing..."}
                                {syncStatus === "error" && `Error: ${syncError}`}
                                {syncStatus === "idle" && lastSyncTime &&
                                    `Last synced: ${new Date(lastSyncTime).toLocaleString()}`}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    color="primary"
                                    variant="flat"
                                    className="max-w-xs"
                                    isLoading={syncStatus === "syncing"}
                                    onPress={sync}
                                >
                                    Sync now
                                </Button>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    className="max-w-xs"
                                    onPress={disconnect}
                                >
                                    Disconnect
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="font-mono text-sm text-default-400">
                                Status: Not connected
                            </p>
                            <Button
                                color="primary"
                                variant="flat"
                                className="max-w-xs"
                                isLoading={isConnecting}
                                onPress={connect}
                            >
                                Connect Google Drive
                            </Button>
                        </>
                    )}
                    {error && (
                        <p className="font-mono text-xs text-danger-500">
                            {error}
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
