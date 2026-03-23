import { DateTime } from "luxon";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileSettingsStore {
    customCurrency: string;
    isPrefixCurrency: boolean;
    timeFormat: "12h" | "24h";
    settingsUpdatedAt: string;
    setCustomCurrency: (value: string) => void;
    setIsPrefixCurrency: (value: boolean) => void;
    setTimeFormat: (format: "12h" | "24h") => void;
    applyRemoteSettings: (
        customCurrency: string,
        isPrefixCurrency: boolean,
        timeFormat: "12h" | "24h",
        settingsUpdatedAt: string,
    ) => void;
}

export const useProfileSettingsStore = create<ProfileSettingsStore>()(
    persist(
        (set) => ({
            customCurrency: "",
            isPrefixCurrency: true,
            timeFormat: "12h",
            settingsUpdatedAt: DateTime.fromMillis(0).toISO()!,
            setCustomCurrency: (value) =>
                set({
                    customCurrency: value,
                    settingsUpdatedAt: DateTime.now().toUTC().toISO()!,
                }),
            setIsPrefixCurrency: (value) =>
                set({
                    isPrefixCurrency: value,
                    settingsUpdatedAt: DateTime.now().toUTC().toISO()!,
                }),
            setTimeFormat: (format) =>
                set({
                    timeFormat: format,
                    settingsUpdatedAt: DateTime.now().toUTC().toISO()!,
                }),
            applyRemoteSettings: (
                customCurrency,
                isPrefixCurrency,
                timeFormat,
                settingsUpdatedAt,
            ) =>
                set({
                    customCurrency,
                    isPrefixCurrency,
                    timeFormat,
                    settingsUpdatedAt,
                }),
        }),
        {
            name: "pangolog-profile-settings",
        },
    ),
);
