import { useEffect, useState } from "react";

const STORAGE_KEY = "pangolog-log-view-settings";

interface LogViewSettings {
    isViewingBigBucks: boolean;
    shouldIncludeBucksInDimes: boolean;
}

const DEFAULT_SETTINGS: LogViewSettings = {
    isViewingBigBucks: false,
    shouldIncludeBucksInDimes: false,
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
    const [isViewingBigBucks, setIsViewingBigBucksState] = useState(false);
    const [shouldIncludeBucksInDimes, setShouldIncludeBucksInDimesState] =
        useState(false);

    useEffect(() => {
        const settings = loadSettings();
        setIsViewingBigBucksState(settings.isViewingBigBucks);
        setShouldIncludeBucksInDimesState(settings.shouldIncludeBucksInDimes);
    }, []);

    function setIsViewingBigBucks(value: boolean) {
        setIsViewingBigBucksState(value);
        saveSettings({ isViewingBigBucks: value, shouldIncludeBucksInDimes });
    }

    function setShouldIncludeBucksInDimes(value: boolean) {
        setShouldIncludeBucksInDimesState(value);
        saveSettings({ isViewingBigBucks, shouldIncludeBucksInDimes: value });
    }

    return {
        isViewingBigBucks,
        setIsViewingBigBucks,
        shouldIncludeBucksInDimes,
        setShouldIncludeBucksInDimes,
    };
}
