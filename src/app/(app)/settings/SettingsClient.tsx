"use client";

import {
    Button,
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Radio,
    RadioGroup,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { clearAllData } from "@/lib/db/sync";
import { exportJson } from "@/lib/export";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useSync } from "@/lib/hooks/useSync";
import {
    executeImport,
    type ImportData,
    type ImportPreview,
    previewImport,
    validateImportData,
} from "@/lib/import";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

export default function SettingsClient() {
    const {
        customCurrency,
        isPrefixCurrency,
        setCustomCurrency,
        setIsPrefixCurrency,
    } = useProfileSettingsStore();
    const { authToken, isConnected, isConnecting, error, connect, disconnect } =
        useGoogleAuth();
    const { theme, setTheme } = useTheme();
    const { sync } = useSync();
    const { syncStatus, lastSyncTime, syncError } = useLocalSettingsStore();

    const [prettyPrint, setPrettyPrint] = useState(true);
    const [isExportingJson, setIsExportingJson] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importData, setImportData] = useState<ImportData | null>(null);
    const [importPreview, setImportPreview] = useState<ImportPreview | null>(
        null,
    );
    const [importError, setImportError] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<ImportPreview | null>(
        null,
    );
    const [isImporting, setIsImporting] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    async function handleReset() {
        setIsResetting(true);
        if (isConnected) disconnect();
        await clearAllData();
        toast.success("All data has been reset. Reloading...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.reload();
    }

    async function handleExportJson() {
        setIsExportingJson(true);
        await exportJson(prettyPrint);
        setIsExportingJson(false);
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!fileInputRef.current) return;
        fileInputRef.current.value = "";
        setImportError(null);
        setImportPreview(null);
        setImportData(null);
        setImportResult(null);
        if (!file) return;

        try {
            const text = await file.text();
            const parsed: unknown = JSON.parse(text);
            if (!validateImportData(parsed)) {
                setImportError(
                    "Invalid file format. Please select a valid Pangolog JSON export.",
                );
                return;
            }
            const preview = await previewImport(parsed);
            setImportData(parsed);
            setImportPreview(preview);
        } catch {
            setImportError(
                "Failed to read file. Make sure it is a valid JSON file.",
            );
        }
    }

    async function handleConfirmImport() {
        if (!importData) return;
        setIsImporting(true);
        const result = await executeImport(importData);
        setIsImporting(false);
        setImportResult(result);
        setImportData(null);
        setImportPreview(null);
    }

    function handleCancelImport() {
        setImportData(null);
        setImportPreview(null);
        setImportError(null);
        setImportResult(null);
    }

    const previewAmount = "12.50";
    const preview = customCurrency
        ? isPrefixCurrency
            ? `${customCurrency}${previewAmount}`
            : `${previewAmount} ${customCurrency}`
        : previewAmount;

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Settings</h2>

            <section className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Theme</h3>
                <RadioGroup
                    orientation="horizontal"
                    value={mounted ? (theme ?? "system") : "system"}
                    onValueChange={setTheme}
                    classNames={{ wrapper: "gap-6" }}
                >
                    <Radio value="light">Light</Radio>
                    <Radio value="dark">Dark</Radio>
                    <Radio value="system">System</Radio>
                </RadioGroup>
            </section>

            <section className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Display Currency</h3>
                <div className="flex flex-col gap-4">
                    <Input
                        classNames={{
                            inputWrapper: "max-w-xs",
                            description: "",
                        }}
                        label="Currency symbol"
                        placeholder="e.g. €, SGD, Gil"
                        description="Cosmetic only, so feel free to use orens, woolong, or bottle caps to your heart's content. Long texts might not look good in this UI, but that's your life decision."
                        value={customCurrency}
                        onValueChange={setCustomCurrency}
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

            <section className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Export Data</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <Button
                            color="primary"
                            variant="flat"
                            isLoading={isExportingJson}
                            onPress={handleExportJson}
                        >
                            Export JSON
                        </Button>
                        <Checkbox
                            isSelected={prettyPrint}
                            onValueChange={setPrettyPrint}
                            size="sm"
                        >
                            <span className="text-sm">Pretty print</span>
                            <p className="text-xs text-default-400">
                                Human-readable formatting.
                            </p>
                        </Checkbox>
                    </div>
                    <p className="text-xs text-default-400">
                        Exports all transactions, categories, and display
                        settings into a single file. On import, records are
                        resolved by last-updated timestamp to avoid duplicates.
                    </p>
                </div>
            </section>

            <section className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Import Data</h3>
                <div className="flex flex-col gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        color="primary"
                        variant="flat"
                        className="max-w-xs"
                        onPress={() => fileInputRef.current?.click()}
                    >
                        Import JSON
                    </Button>
                    {importError && (
                        <p className="text-xs text-danger-500">{importError}</p>
                    )}
                    {importPreview && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg bg-default-100 text-sm">
                            <p className="font-semibold text-default-700">
                                Preview:
                            </p>
                            <p className="text-default-600">
                                Dimes: +{importPreview.dimesAdded} new,{" "}
                                {importPreview.dimesUpdated} updated
                            </p>
                            <p className="text-default-600">
                                Bucks: +{importPreview.bucksAdded} new,{" "}
                                {importPreview.bucksUpdated} updated
                            </p>
                            <p className="text-default-600">
                                Categories: +{importPreview.categoriesAdded}{" "}
                                new, {importPreview.categoriesUpdated} updated
                            </p>
                            <p className="text-default-600">
                                Recurring rules: +{importPreview.rulesAdded}{" "}
                                new, {importPreview.rulesUpdated} updated
                            </p>
                            <div className="flex gap-2 mt-1">
                                <Button
                                    size="sm"
                                    color="primary"
                                    isLoading={isImporting}
                                    onPress={handleConfirmImport}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    size="sm"
                                    variant="light"
                                    onPress={handleCancelImport}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                    {importResult && (
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-success-50 text-sm">
                            <p className="font-semibold text-success-700">
                                Import complete.
                            </p>
                            <p className="text-success-600">
                                Dimes: +{importResult.dimesAdded} new,{" "}
                                {importResult.dimesUpdated} updated
                            </p>
                            <p className="text-success-600">
                                Bucks: +{importResult.bucksAdded} new,{" "}
                                {importResult.bucksUpdated} updated
                            </p>
                            <p className="text-success-600">
                                Categories: +{importResult.categoriesAdded} new,{" "}
                                {importResult.categoriesUpdated} updated
                            </p>
                            <p className="text-success-600">
                                Recurring rules: +{importResult.rulesAdded} new,{" "}
                                {importResult.rulesUpdated} updated
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h3 className="font-mono text-lg font-semibold mb-4">
                    Google Drive Sync
                </h3>
                <div className="flex flex-col gap-3">
                    {lastSyncTime && (
                        <p className="text-xs text-default-400">
                            Last synced:{" "}
                            {new Date(lastSyncTime).toLocaleString()}
                        </p>
                    )}
                    {isConnected ? (
                        <>
                            <p className="text-sm text-success-500">
                                Status: Connected as {authToken?.email}
                            </p>
                            <p className="text-xs text-default-400">
                                {syncStatus === "syncing" && "Syncing..."}
                                {syncStatus === "error" &&
                                    `Error: ${syncError}`}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    color="primary"
                                    variant="flat"
                                    className="max-w-xs"
                                    isLoading={syncStatus === "syncing"}
                                    onPress={() => sync()}
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
                            <p className="text-sm text-default-400">
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
                        <p className="text-xs text-danger-500">{error}</p>
                    )}
                </div>
            </section>

            <section className="mt-12 mb-8">
                <h3 className="text-lg font-semibold mb-1">Help &amp; Info</h3>
                <p className="text-xs text-default-400 mb-4">
                    Overview of concepts, pages, hotkeys, and sync behaviour.
                </p>
                <Button
                    as="a"
                    href="/help"
                    color="primary"
                    variant="flat"
                >
                    View manual
                </Button>
            </section>

            <section className="mt-12">
                <h3 className="font-mono text-lg font-semibold mb-1 text-danger">
                    Danger Zone
                </h3>
                <p className="text-xs text-default-400 mb-4">
                    Disconnects Google Drive and permanently deletes all local
                    data. Your data on Google Drive will remain intact. Use this
                    to start fresh on this device. This cannot be undone.
                </p>
                <Button
                    color="danger"
                    variant="flat"
                    onPress={() => setIsResetDialogOpen(true)}
                >
                    Reset all data
                </Button>
            </section>

            <Modal
                isOpen={isResetDialogOpen}
                onClose={() => setIsResetDialogOpen(false)}
                classNames={{ closeButton: "cursor-pointer" }}
            >
                <ModalContent>
                    <ModalHeader>Reset all data?</ModalHeader>
                    <ModalBody>
                        <p className="text-sm text-default-600">
                            This will disconnect Google Drive and permanently
                            delete all local transactions, categories, and
                            settings. This cannot be undone.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onPress={() => setIsResetDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            isLoading={isResetting}
                            onPress={handleReset}
                        >
                            Reset
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
