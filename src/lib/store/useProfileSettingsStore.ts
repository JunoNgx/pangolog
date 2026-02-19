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
            settingsUpdatedAt: new Date(0).toISOString(),
            setCustomCurrency: (value) =>
                set({
                    customCurrency: value,
                    settingsUpdatedAt: new Date().toISOString(),
                }),
            setIsPrefixCurrency: (value) =>
                set({
                    isPrefixCurrency: value,
                    settingsUpdatedAt: new Date().toISOString(),
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
