import { DateTime } from "luxon";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileSettingsStore {
    customCurrency: string;
    isPrefixCurrency: boolean;
    settingsUpdatedAt: string;
    setCustomCurrency: (value: string) => void;
    setIsPrefixCurrency: (value: boolean) => void;
    applyRemoteSettings: (
        customCurrency: string,
        isPrefixCurrency: boolean,
        settingsUpdatedAt: string,
    ) => void;
}

export const useProfileSettingsStore = create<ProfileSettingsStore>()(
    persist(
        (set) => ({
            customCurrency: "",
            isPrefixCurrency: true,
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
            applyRemoteSettings: (
                customCurrency,
                isPrefixCurrency,
                settingsUpdatedAt,
            ) => set({ customCurrency, isPrefixCurrency, settingsUpdatedAt }),
        }),
        {
            name: "pangolog-profile-settings",
        },
    ),
);
