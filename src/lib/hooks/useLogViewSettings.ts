import { useState } from "react";

const STORAGE_KEY = "pangolog-log-view-settings";

interface LogViewSettings {
    shouldShowSmallDimes: boolean;
    shouldShowBigBucks: boolean;
}

const DEFAULT_SETTINGS: LogViewSettings = {
    shouldShowSmallDimes: true,
    shouldShowBigBucks: false,
};

function loadSettings(): LogViewSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(settings: LogViewSettings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
}

export function useLogViewSettings() {
    const initial = loadSettings();
    const [shouldShowSmallDimes, setShouldShowSmallDimesState] = useState(
        initial.shouldShowSmallDimes,
    );
    const [shouldShowBigBucks, setShouldShowBigBucksState] = useState(
        initial.shouldShowBigBucks,
    );

    function setShouldShowSmallDimes(value: boolean) {
        setShouldShowSmallDimesState(value);
        saveSettings({
            shouldShowSmallDimes: value,
            shouldShowBigBucks,
        });
    }

    function setShouldShowBigBucks(value: boolean) {
        setShouldShowBigBucksState(value);
        saveSettings({
            shouldShowSmallDimes,
            shouldShowBigBucks: value,
        });
    }

    return {
        shouldShowSmallDimes,
        setShouldShowSmallDimes,
        shouldShowBigBucks,
        setShouldShowBigBucks,
    };
}
