"use client";

import {
    type LoggerEntry,
    useLocalSettingsStore,
} from "@/lib/store/useLocalSettingsStore";

export function useLogger() {
    const loggerEntries = useLocalSettingsStore((state) => state.loggerEntries);
    const setLoggerEntries = useLocalSettingsStore((state) => state.setLoggerEntries);

    function getLoggerEntries() {
        return [...loggerEntries];
    }

    function addLoggerEntry(
        message: string,
        logcode?: string,
        data?: any
    ) {
        const newEntry = {
            datetime: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }),
            message,
            logcode,
            data,
        };
        setLoggerEntries([...loggerEntries, newEntry]);
    }

    function clearLoggerEntries() {
        setLoggerEntries([]);
    }

    return {
        getLoggerEntries,
        addLoggerEntry,
        clearLoggerEntries,
    };
};

