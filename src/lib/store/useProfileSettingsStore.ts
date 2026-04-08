import { DateTime } from "luxon";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileSettingsStore {
    customCurrency: string;
    isPrefixCurrency: boolean;
    isExpenseOnlyMode: boolean;
    isCategoryAlphabetical: boolean;
    settingsUpdatedAt: string;
    setCustomCurrency: (value: string) => void;
    setIsPrefixCurrency: (value: boolean) => void;
    setIsExpenseOnlyMode: (value: boolean) => void;
    setIsCategoryAlphabetical: (value: boolean) => void;
    applyRemoteSettings: (
        customCurrency: string,
        isPrefixCurrency: boolean,
        isExpenseOnlyMode: boolean,
        isCategoryAlphabetical: boolean,
        settingsUpdatedAt: string,
    ) => void;
}

export const useProfileSettingsStore = create<ProfileSettingsStore>()(
    persist(
        (set) => ({
            customCurrency: "",
            isPrefixCurrency: true,
            isExpenseOnlyMode: false,
            isCategoryAlphabetical: false,
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
            setIsExpenseOnlyMode: (value) =>
                set({
                    isExpenseOnlyMode: value,
                    settingsUpdatedAt: DateTime.now().toUTC().toISO()!,
                }),
            setIsCategoryAlphabetical: (value) =>
                set({
                    isCategoryAlphabetical: value,
                    settingsUpdatedAt: DateTime.now().toUTC().toISO()!,
                }),
            applyRemoteSettings: (
                customCurrency,
                isPrefixCurrency,
                isExpenseOnlyMode,
                isCategoryAlphabetical,
                settingsUpdatedAt,
            ) =>
                set({
                    customCurrency,
                    isPrefixCurrency,
                    isExpenseOnlyMode,
                    isCategoryAlphabetical,
                    settingsUpdatedAt,
                }),
        }),
        {
            name: "pangolog-profile-settings",
        },
    ),
);
