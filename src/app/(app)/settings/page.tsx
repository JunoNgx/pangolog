"use client";

import { Button, Input, Radio, RadioGroup } from "@heroui/react";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

export default function SettingsPage() {
    const {
        customCurrency,
        isPrefixCurrency,
        setCustomCurrency,
        setIsPrefixCurrency,
    } = useProfileSettingsStore();

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
                    <p className="text-sm text-default-400 font-mono">
                        Status: Not connected
                    </p>
                    <Button
                        color="primary"
                        variant="flat"
                        className="max-w-xs"
                        isDisabled
                    >
                        Connect Google Drive
                    </Button>
                    <p className="text-xs text-default-400">
                        Google Drive sync is not yet available.
                    </p>
                </div>
            </section>
        </div>
    );
}
