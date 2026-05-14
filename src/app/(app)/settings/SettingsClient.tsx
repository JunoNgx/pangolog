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
import { DateTime } from "luxon";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DriveSyncSection } from "@/app/(app)/settings/DriveSyncSection";
import { ImportDataSection } from "@/app/(app)/settings/ImportDataSection";
import { MainListContainer } from "@/components/MainListContainer";
import { RouteHeader } from "@/components/RouteHeader";
import { DEFAULT_MODAL_CLASS_NAMES } from "@/lib/constants";
import { clearAllData, forceDeleteDb } from "@/lib/db";
import { exportJson } from "@/lib/export";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useLogger } from "@/lib/hooks/useLogger";
import { clearSwCaches } from "@/lib/serviceWorker";
import { useLocalAppDataStore } from "@/lib/store/useLocalAppDataStore";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
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
    const { isConnected, disconnect } = useGoogleAuth();
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
            toast.error(`Record clearing failed: ${err}`);
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
            toast.error(`Reset failed: ${err}`);
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
            toast.error(
                `Unable to copy Logger content to clipboard: ${error}`,
                {
                    duration: Infinity,
                },
            );
        }
    }

    function handleDumpDebugLoggerContent() {
        const entries = getLoggerEntries();
        const jsonString = JSON.stringify(entries, null, 2);

        const blob = new Blob([jsonString], { type: "application/json" });
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
                        <p className="text-default-500 font-mono text-sm">
                            Preview: {preview}
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
                    <div className="flex flex-col gap-4">
                        <Checkbox
                            isSelected={isExpenseOnlyMode}
                            onValueChange={setIsExpenseOnlyMode}
                            size="sm"
                        >
                            <span className="text-sm">Expense only mode</span>
                            <p className="text-default-400 text-xs">
                                Hides income-related UI to reduce clutter.
                            </p>
                        </Checkbox>
                        <RadioGroup
                            label="Category order"
                            orientation="horizontal"
                            value={isCategoryAlphabetical ? "alpha" : "custom"}
                            onValueChange={(v) =>
                                setIsCategoryAlphabetical(v === "alpha")
                            }
                            classNames={{ wrapper: "gap-6" }}
                        >
                            <Radio value="custom">Custom order</Radio>
                            <Radio value="alpha">Alphabetical</Radio>
                        </RadioGroup>
                        <RadioGroup
                            label="Time format"
                            orientation="horizontal"
                            value={timeFormat}
                            onValueChange={(v) =>
                                setTimeFormat(v as TimeFormat)
                            }
                            classNames={{ wrapper: "gap-6" }}
                        >
                            <Radio value="12h">12-hour</Radio>
                            <Radio value="24h">24-hour</Radio>
                        </RadioGroup>
                        <RadioGroup
                            label="Theme"
                            orientation="horizontal"
                            value={theme ?? "system"}
                            onValueChange={setTheme}
                            classNames={{ wrapper: "gap-6" }}
                        >
                            <Radio value="light">Light</Radio>
                            <Radio value="dark">Dark</Radio>
                            <Radio value="system">System</Radio>
                        </RadioGroup>
                    </div>
                </section>

                <section>
                    <h3 className="mb-4 text-lg font-semibold">Export Data</h3>
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
                                isSelected={isPrettyPrint}
                                onValueChange={setIsPrettyPrint}
                                size="sm"
                            >
                                <span className="text-sm">Pretty print</span>
                                <p className="text-default-400 text-xs">
                                    Human-readable formatting.
                                </p>
                            </Checkbox>
                        </div>
                        <p className="text-default-400 text-xs">
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
                    <p className="text-default-400 mb-4 text-xs">
                        Overview of concepts, pages, hotkeys, and sync
                        behaviour.
                    </p>
                    <Button
                        as="a"
                        href="/help"
                        color="primary"
                        variant="flat"
                        className="self-start"
                    >
                        View manual
                    </Button>
                </section>

                <section>
                    <h3 className="mb-1 text-lg font-semibold">
                        Troubleshooting
                    </h3>
                    <p className="text-default-400 mb-4 text-xs">
                        If the app appears outdated after an update, clear the
                        offline cache to force a fresh reload. Your data is
                        stored separately and will not be affected.
                    </p>
                    <Button variant="flat" onPress={handleClearSwCache}>
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
                        <p className="text-default-400 text-xs">
                            Pangolog is developed by{" "}
                            <a
                                href="https://junongx.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-500 hover:underline"
                            >
                                Juno Nguyen
                            </a>
                            , with playfulness and curiosity.
                        </p>
                        <p className="text-default-400 text-xs">
                            This project is free and{" "}
                            <a
                                href="https://github.com/JunoNgx/pangolog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-500 hover:underline"
                            >
                                open source software
                            </a>
                            .
                        </p>
                        <p className="text-default-400 mt-2 font-mono text-xs">
                            v{process.env.NEXT_PUBLIC_VERSION} (
                            {process.env.NEXT_PUBLIC_COMMIT_HASH})
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                                as="a"
                                href="/privacy"
                                variant="flat"
                                size="sm"
                            >
                                Privacy Policy
                            </Button>
                            <Button
                                as="a"
                                href="/terms"
                                variant="flat"
                                size="sm"
                            >
                                Terms of Service
                            </Button>
                        </div>
                    </div>
                </section>

                {/* DEBUG */}
                {isDebugVisible && (
                    <section className="mt-8">
                        <h3 className="mb-1 text-lg font-semibold">Debug</h3>
                        <Button
                            variant="flat"
                            onPress={() =>
                                toast("Debug toast notification", {
                                    duration: Infinity,
                                })
                            }
                        >
                            Trigger toast
                        </Button>

                        <Button
                            className="mt-2 block"
                            variant="flat"
                            onPress={() => setIsLogDialogOpen(true)}
                        >
                            View logs
                        </Button>

                        <Button
                            className="mt-2 block"
                            color="danger"
                            variant="flat"
                            onPress={handleClearDebugLoggerEntry}
                        >
                            Clear Logger entries
                        </Button>

                        <p className="text-default-400 mt-8 text-xs">
                            Wipes the local database and all local app data.
                            This will make a fresh new user experience. Your
                            data on Google Drive will remain intact. This cannot
                            be undone.
                        </p>
                        <Button
                            className="mt-2 block"
                            color="danger"
                            variant="flat"
                            onPress={() => setIsResetAppDialogOpen(true)}
                        >
                            Reset app
                        </Button>
                    </section>
                )}
                {/* END DEBUG */}

                <section className="mt-8">
                    <h3 className="text-danger mb-1 text-lg font-semibold">
                        Danger Zone
                    </h3>
                    <p className="text-default-400 mb-4 text-xs">
                        Removes all local transactions, categories, and
                        recurring rules, and disconnects Google Drive. Your data
                        on Google Drive will remain intact.
                    </p>
                    <Button
                        color="danger"
                        variant="flat"
                        onPress={() => setIsResetDialogOpen(true)}
                    >
                        Clear local records
                    </Button>
                </section>
            </MainListContainer>

            <Modal
                isOpen={isClearRecordsDialogOpen}
                onClose={() => setIsResetDialogOpen(false)}
                classNames={DEFAULT_MODAL_CLASS_NAMES}
            >
                <ModalContent>
                    <ModalHeader>Clear local records?</ModalHeader>
                    <ModalBody>
                        <p className="text-danger-500 text-sm">
                            This cannot be undone.
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
                            isLoading={isClearingRecords}
                            onPress={handleClearLocalRecords}
                        >
                            Clear
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isResetAppDialogOpen}
                onClose={() => setIsResetAppDialogOpen(false)}
                classNames={DEFAULT_MODAL_CLASS_NAMES}
            >
                <ModalContent>
                    <ModalHeader>Confirm resetting app?</ModalHeader>
                    <ModalBody>
                        <p className="text-danger-500 text-sm">
                            This cannot be undone.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onPress={() => setIsResetAppDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            isLoading={isResettingApp}
                            onPress={handleResetApp}
                        >
                            Reset app
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isLogDialogOpen}
                onClose={() => setIsLogDialogOpen(false)}
                size="full"
                classNames={DEFAULT_MODAL_CLASS_NAMES}
            >
                <ModalContent>
                    <ModalHeader>Logs</ModalHeader>
                    <ModalBody className="overflow-y-auto">
                        <pre className="font-mono text-xs break-all whitespace-pre-wrap">
                            {JSON.stringify(getLoggerEntries(), null, 2)}
                        </pre>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="flat"
                            onPress={handleDumpDebugLoggerContent}
                        >
                            Export logs
                        </Button>
                        <Button
                            variant="flat"
                            onPress={handleCopyDebugLoggerEntries}
                        >
                            Copy content
                        </Button>
                        <Button
                            variant="light"
                            onPress={() => setIsLogDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
