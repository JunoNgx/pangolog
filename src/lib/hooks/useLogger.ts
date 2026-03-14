"use client";

import { DateTime } from "luxon";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";

const MAX_LOG_ENTRIES = 500;
const LOG_RETENTION_DAYS = 30;

export function useLogger() {
    const setLoggerEntries = useLocalSettingsStore(
        (state) => state.setLoggerEntries,
    );

    function getLoggerEntries() {
        const currentEntries = useLocalSettingsStore.getState().loggerEntries;
        return [...currentEntries];
    }

    function addLoggerEntry(message: string, logcode?: string, data?: any) {
        const now = DateTime.now();
        const newEntry = {
            timestamp: now.toISO()!,
            message,
            logcode,
            data,
        };

        const cutoff = now.minus({ days: LOG_RETENTION_DAYS });
        const currentEntries = useLocalSettingsStore.getState().loggerEntries;
        const pruned = [...currentEntries, newEntry].filter(
            (e) => DateTime.fromISO(e.timestamp) >= cutoff,
        );
        const capped =
            pruned.length > MAX_LOG_ENTRIES
                ? pruned.slice(pruned.length - MAX_LOG_ENTRIES)
                : pruned;

        setLoggerEntries(capped);
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
