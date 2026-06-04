"use client";

import {
    Button,
    Checkbox,
    Input,
    Label,
    Modal,
    Radio,
    RadioGroup,
    toast,
} from "@heroui/react";
import { DateTime } from "luxon";
import { useTheme } from "next-themes";
import { useLayoutEffect, useRef, useState } from "react";
import { DriveSyncSection } from "@/app/(app)/settings/DriveSyncSection";
import { ImportDataSection } from "@/app/(app)/settings/ImportDataSection";
import { MainListContainer } from "@/components/MainListContainer";
import { RouteHeader } from "@/components/RouteHeader";
import { MIME_JSON } from "@/lib/constants";
import { clearAllData, forceDeleteDb } from "@/lib/db";
import { exportJson } from "@/lib/export";
import { useLogger } from "@/lib/hooks/useLogger";
import { clearSwCaches } from "@/lib/serviceWorker";
import { useLocalAppDataStore } from "@/lib/store/useLocalAppDataStore";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { useSyncProvider } from "@/lib/sync/useSyncProvider";
import type { TimeFormat } from "@/lib/types";
import { toIsoDateString } from "@/lib/utils";

export default function SettingsClient() {
    const {
        customCurrency,
        isPrefixCurrency,
        isExpenseOnlyMode,
        isCategoryAlphabetical,
        setCustomCurrency,
        setIsPrefixCurrency,
        setIsExpenseOnlyMode,
        setIsCategoryAlphabetical,
    } = useProfileSettingsStore();
    const { isConnected, disconnect } = useSyncProvider();
    const { theme, setTheme } = useTheme();
    const { setLastSyncTime } = useLocalSyncDataStore();
    const { setShouldShowDemoDataBanner } = useLocalAppDataStore();
    const { timeFormat, setTimeFormat } = useLocalUserSettingsStore();
    const { getLoggerEntries, clearLoggerEntries } = useLogger();

    const [isPrettyPrint, setIsPrettyPrint] = useState(true);
    const [isExportingJson, setIsExportingJson] = useState(false);

    const [isClearRecordsDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isClearingRecords, setIsResetting] = useState(false);
    const [isResetAppDialogOpen, setIsResetAppDialogOpen] = useState(false);
    const [isResettingApp, setIsResettingApp] = useState(false);

    const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

    const [isDebugVisible, setIsDebugVisible] = useState(false);
    const [isThemeMounted, setIsThemeMounted] = useState(false);
    useLayoutEffect(() => setIsThemeMounted(true), []);
    const headingTapCountRef = useRef(0);
    const headingTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    function handleDebugRevealTap() {
        headingTapCountRef.current += 1;
        if (headingTapTimeoutRef.current)
            clearTimeout(headingTapTimeoutRef.current);
        headingTapTimeoutRef.current = setTimeout(() => {
            headingTapCountRef.current = 0;
        }, 1500);
        if (headingTapCountRef.current >= 5) {
            headingTapCountRef.current = 0;
            setIsDebugVisible((prev) => !prev);
            toast(
                isDebugVisible
                    ? "Debug settings are now hidden."
                    : "Debug settings are now visible.",
            );
        }
    }

    async function handleClearLocalRecords() {
        setIsResetting(true);
        try {
            if (isConnected) disconnect();
            await clearAllData();
            setLastSyncTime(null);
            setShouldShowDemoDataBanner(true);
            toast.success("All data has been reset. Reloading...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            window.location.reload();
        } catch (err) {
            toast.danger(`Record clearing failed: ${err}`);
            setIsResetting(false);
        }
    }

    async function handleResetApp() {
        setIsResettingApp(true);
        try {
            localStorage.clear();
            sessionStorage.clear();
            await forceDeleteDb();
            await clearSwCaches();
            toast.success("App reset. Reloading...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            window.location.href = "/";
        } catch (err) {
            toast.danger(`Reset failed: ${err}`);
            setIsResettingApp(false);
        }
    }

    async function handleExportJson() {
        setIsExportingJson(true);
        await exportJson(isPrettyPrint);
        setIsExportingJson(false);
    }

    const previewAmount = "12.50";
    const preview = customCurrency
        ? isPrefixCurrency
            ? `${customCurrency}${previewAmount}`
            : `${previewAmount} ${customCurrency}`
        : previewAmount;

    async function handleClearSwCache() {
        await clearSwCaches();
        toast.success("Offline cache cleared.");
    }

    function handleClearDebugLoggerEntry() {
        clearLoggerEntries();
    }

    async function handleCopyDebugLoggerEntries() {
        const entries = getLoggerEntries();
        const content = JSON.stringify(entries, null, 2);
        try {
            console.log("Logger content: ", content);
            await navigator.clipboard.writeText(content);
        } catch (error) {
            toast.danger(
                `Unable to copy Logger content to clipboard: ${error}`,
                { timeout: 0 },
            );
        }
    }

    function handleDumpDebugLoggerContent() {
        const entries = getLoggerEntries();
        const jsonString = JSON.stringify(entries, null, 2);

        const blob = new Blob([jsonString], { type: MIME_JSON });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        const todayDateStr = toIsoDateString(DateTime.now());
        link.href = url;
        link.download = `pangolog-logdump-${todayDateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const logsModal = (
        <Modal isOpen={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
            <Modal.Trigger>
                <Button variant="secondary">View logs</Button>
            </Modal.Trigger>
            <Modal.Backdrop>
                <Modal.Container size="full">
                    <Modal.Dialog>
                        <Modal.CloseTrigger className="cursor-pointer" />
                        <Modal.Header>
                            <Modal.Heading>Logs</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="overflow-y-auto">
                            <pre className="font-mono text-xs break-all whitespace-pre-wrap">
                                {JSON.stringify(getLoggerEntries(), null, 2)}
                            </pre>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onPress={handleDumpDebugLoggerContent}
                            >
                                Export logs
                            </Button>
                            <Button
                                variant="secondary"
                                onPress={handleCopyDebugLoggerEntries}
                            >
                                Copy content
                            </Button>
                            <Button
                                variant="tertiary"
                                onPress={() => setIsLogDialogOpen(false)}
                            >
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );

    const resetAppModal = (
        <Modal
            isOpen={isResetAppDialogOpen}
            onOpenChange={setIsResetAppDialogOpen}
        >
            <Modal.Trigger>
                <Button className="mt-2 block" variant="danger-soft">
                    Reset app
                </Button>
            </Modal.Trigger>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger className="cursor-pointer" />
                        <Modal.Header>
                            <Modal.Heading>
                                Confirm resetting app?
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="text-danger text-sm">
                                This cannot be undone.
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="tertiary"
                                onPress={() => setIsResetAppDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                isPending={isResettingApp}
                                onPress={handleResetApp}
                            >
                                Reset app
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );

    const clearRecordsModal = (
        <Modal
            isOpen={isClearRecordsDialogOpen}
            onOpenChange={setIsResetDialogOpen}
        >
            <Modal.Trigger>
                <Button variant="danger-soft">Clear local records</Button>
            </Modal.Trigger>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger className="cursor-pointer" />
                        <Modal.Header>
                            <Modal.Heading>Clear local records?</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="text-danger text-sm">
                                This cannot be undone.
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="tertiary"
                                onPress={() => setIsResetDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                isPending={isClearingRecords}
                                onPress={handleClearLocalRecords}
                            >
                                Clear
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );

    return (
        <div>
            <div className="mb-6">
                <RouteHeader label="Settings" />
            </div>

            <MainListContainer as="div" className="gap-8">
                <DriveSyncSection />

                <section>
                    <h3 className="mb-4 text-lg font-semibold">
                        Display Currency
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex max-w-xs flex-col gap-1">
                            <span>Currency symbol</span>
                            <Input
                                placeholder="e.g. €, SGD, Gil"
                                value={customCurrency}
                                onChange={(e) =>
                                    setCustomCurrency(e.target.value)
                                }
                            />
                            <span className="text-muted text-xs">
                                Cosmetic only, so feel free to use orens,
                                woolong, or bottle caps to your heart's content.
                                Long texts might not look good in this UI, but
                                that's your life decision.
                            </span>
                        </div>
                        <RadioGroup
                            orientation="horizontal"
                            value={isPrefixCurrency ? "prefix" : "suffix"}
                            onChange={(v) =>
                                setIsPrefixCurrency(v === "prefix")
                            }
                        >
                            <Label>Position</Label>
                            <Radio value="prefix">
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label>Prefix ($12)</Label>
                                </Radio.Content>
                            </Radio>
                            <Radio value="suffix">
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label>Suffix (12 SGD)</Label>
                                </Radio.Content>
                            </Radio>
                        </RadioGroup>
                        <p className="text-muted font-mono text-sm">
                            Preview: {preview}
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
                    <div className="flex flex-col gap-4">
                        <Checkbox
                            isSelected={isExpenseOnlyMode}
                            onChange={setIsExpenseOnlyMode}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Content>
                                <Label>Expense only mode</Label>
                                <span className="text-muted text-xs">
                                    Hides income-related UI to reduce clutter.
                                </span>
                            </Checkbox.Content>
                        </Checkbox>
                        <RadioGroup
                            orientation="horizontal"
                            value={isCategoryAlphabetical ? "alpha" : "custom"}
                            onChange={(v) =>
                                setIsCategoryAlphabetical(v === "alpha")
                            }
                            className="gap-6"
                        >
                            <Label>Category order</Label>
                            <Radio value="custom">
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label>Custom order</Label>
                                </Radio.Content>
                            </Radio>
                            <Radio value="alpha">
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label>Alphabetical</Label>
                                </Radio.Content>
                            </Radio>
                        </RadioGroup>
                        <RadioGroup
                            orientation="horizontal"
                            value={timeFormat}
                            onChange={(v) => setTimeFormat(v as TimeFormat)}
                            className="gap-6"
                        >
                            <Label>Time format</Label>
                            <Radio value="12h">
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label>12-hour</Label>
                                </Radio.Content>
                            </Radio>
                            <Radio value="24h">
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label>24-hour</Label>
                                </Radio.Content>
                            </Radio>
                        </RadioGroup>
                        {isThemeMounted ? (
                            <RadioGroup
                                orientation="horizontal"
                                value={theme ?? "system"}
                                onChange={setTheme}
                                className="gap-6"
                            >
                                <Label>Theme</Label>
                                <Radio value="light">
                                    <Radio.Control>
                                        <Radio.Indicator />
                                    </Radio.Control>
                                    <Radio.Content>
                                        <Label>Light</Label>
                                    </Radio.Content>
                                </Radio>
                                <Radio value="dark">
                                    <Radio.Control>
                                        <Radio.Indicator />
                                    </Radio.Control>
                                    <Radio.Content>
                                        <Label>Dark</Label>
                                    </Radio.Content>
                                </Radio>
                                <Radio value="system">
                                    <Radio.Control>
                                        <Radio.Indicator />
                                    </Radio.Control>
                                    <Radio.Content>
                                        <Label>System</Label>
                                    </Radio.Content>
                                </Radio>
                            </RadioGroup>
                        ) : (
                            <div className="h-32" aria-hidden />
                        )}
                    </div>
                </section>

                <section>
                    <h3 className="mb-4 text-lg font-semibold">Export Data</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                isPending={isExportingJson}
                                onPress={handleExportJson}
                            >
                                Export JSON
                            </Button>
                            <Checkbox
                                isSelected={isPrettyPrint}
                                onChange={setIsPrettyPrint}
                            >
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Checkbox.Content>
                                    <Label>Pretty print</Label>
                                    <span className="text-muted text-xs">
                                        Human-readable formatting.
                                    </span>
                                </Checkbox.Content>
                            </Checkbox>
                        </div>
                        <p className="text-muted text-xs">
                            Exports all transactions, categories, and display
                            settings into a single file. On import, records are
                            resolved by last-updated timestamp to avoid
                            duplicates.
                        </p>
                    </div>
                </section>

                <ImportDataSection />

                <section>
                    <h3 className="mb-1 text-lg font-semibold">
                        Help &amp; Info
                    </h3>
                    <p className="text-muted mb-4 text-xs">
                        Overview of concepts, pages, hotkeys, and sync
                        behaviour.
                    </p>
                    <a
                        href="/help"
                        className="bg-accent text-accent-foreground inline-flex items-center justify-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
                    >
                        View manual
                    </a>
                </section>

                <section>
                    <h3 className="mb-1 text-lg font-semibold">
                        Troubleshooting
                    </h3>
                    <p className="text-muted mb-4 text-xs">
                        If the app appears outdated after an update, clear the
                        offline cache to force a fresh reload. Your data is
                        stored separately and will not be affected.
                    </p>
                    <Button variant="secondary" onPress={handleClearSwCache}>
                        Clear offline cache
                    </Button>
                </section>

                <section>
                    <h3
                        className="mb-2 text-lg font-semibold"
                        onClick={handleDebugRevealTap}
                        onKeyDown={handleDebugRevealTap}
                        // biome-ignore lint/a11y/noNoninteractiveTabindex: intentional
                        tabIndex={0}
                    >
                        About
                    </h3>
                    <div className="flex flex-col gap-1">
                        <p className="text-muted text-xs">
                            Pangolog is developed by{" "}
                            <a
                                href="https://junongx.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Juno Nguyen
                            </a>
                            , with playfulness and curiosity.
                        </p>
                        <p className="text-muted text-xs">
                            This project is free and{" "}
                            <a
                                href="https://github.com/JunoNgx/pangolog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                open source software
                            </a>
                            .
                        </p>
                        <p className="text-muted mt-2 font-mono text-xs">
                            v{process.env.NEXT_PUBLIC_VERSION} (
                            {process.env.NEXT_PUBLIC_COMMIT_HASH})
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <a
                                href="/privacy"
                                className="bg-surface text-muted hover:text-foreground hover:bg-surface-secondary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="/terms"
                                className="bg-surface text-muted hover:text-foreground hover:bg-surface-secondary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                            >
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </section>

                {/* DEBUG */}
                {isDebugVisible && (
                    <section className="mt-8">
                        <h3 className="mb-1 text-lg font-semibold">Debug</h3>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onPress={() =>
                                    toast("Debug toast notification", {
                                        timeout: 0,
                                    })
                                }
                            >
                                Trigger toast
                            </Button>

                            {logsModal}
                        </div>

                        <Button
                            className="mt-2 block"
                            variant="danger-soft"
                            onPress={handleClearDebugLoggerEntry}
                        >
                            Clear Logger entries
                        </Button>

                        <p className="text-muted mt-8 text-xs">
                            Wipes the local database and all local app data.
                            This will make a fresh new user experience. Your
                            data on Google Drive will remain intact. This cannot
                            be undone.
                        </p>
                        {resetAppModal}
                    </section>
                )}
                {/* END DEBUG */}

                <section className="mt-8">
                    <h3 className="text-danger mb-1 text-lg font-semibold">
                        Danger Zone
                    </h3>
                    <p className="text-muted mb-4 text-xs">
                        Removes all local transactions, categories, and
                        recurring rules, and disconnects Google Drive. Your data
                        on Google Drive will remain intact.
                    </p>
                    {clearRecordsModal}
                </section>
            </MainListContainer>
        </div>
    );
}
