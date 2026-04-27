"use client";

import { DateTime } from "luxon";
import { useLocalAppDataStore } from "@/lib/store/useLocalAppDataStore";
import { toIsoString } from "@/lib/utils";

const MAX_LOG_ENTRIES = 500;
const LOG_RETENTION_DAYS = 30;

export function useLogger() {
    const setLoggerEntries = useLocalAppDataStore(
        (state) => state.setLoggerEntries,
    );

    function getLoggerEntries() {
        const currentEntries = useLocalAppDataStore.getState().loggerEntries;
        return [...currentEntries];
    }

    function addLoggerEntry(message: string, logcode?: string, data?: unknown) {
        const now = DateTime.now();
        const newEntry = {
            timestamp: toIsoString(now),
            message,
            logcode,
            data,
        };

        const cutoff = now.minus({ days: LOG_RETENTION_DAYS });
        const currentEntries = useLocalAppDataStore.getState().loggerEntries;
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
