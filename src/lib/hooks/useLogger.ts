"use client";

import { DateTime } from "luxon";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";

export function useLogger() {
    const setLoggerEntries = useLocalSettingsStore(
        (state) => state.setLoggerEntries,
    );

    function getLoggerEntries() {
        const currentEntries = useLocalSettingsStore.getState().loggerEntries;
        return [...currentEntries];
    }

    function addLoggerEntry(message: string, logcode?: string, data?: any) {
        const newEntry = {
            datetime: DateTime.now().toLocaleString({
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

        const currentEntries = useLocalSettingsStore.getState().loggerEntries;
        setLoggerEntries([...currentEntries, newEntry]);
    }

    function clearLoggerEntries() {
        setLoggerEntries([]);
    }

    return {
        getLoggerEntries,
        addLoggerEntry,
        clearLoggerEntries,
    };
}
