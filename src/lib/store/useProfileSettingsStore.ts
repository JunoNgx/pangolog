import { DateTime } from "luxon";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PERSIST_PROFILE } from "@/lib/constants";
import { toIsoString, utcNowString } from "@/lib/utils";

interface ProfileSettingsStore {
    customCurrency: string;
    isPrefixCurrency: boolean;
    isExpenseOnlyMode: boolean;
    isCategoryAlphabetical: boolean;
    updatedAt: string;
    setCustomCurrency: (value: string) => void;
    setIsPrefixCurrency: (value: boolean) => void;
    setIsExpenseOnlyMode: (value: boolean) => void;
    setIsCategoryAlphabetical: (value: boolean) => void;
    applyRemoteSettings: (
        customCurrency: string,
        isPrefixCurrency: boolean,
        isExpenseOnlyMode: boolean,
        isCategoryAlphabetical: boolean,
        updatedAt: string,
    ) => void;
}

export const useProfileSettingsStore = create<ProfileSettingsStore>()(
    persist(
        (set) => ({
            customCurrency: "",
            isPrefixCurrency: true,
            isExpenseOnlyMode: false,
            isCategoryAlphabetical: false,
            updatedAt: toIsoString(DateTime.fromMillis(0)),
            setCustomCurrency: (value) =>
                set({
                    customCurrency: value,
                    updatedAt: utcNowString(),
                }),
            setIsPrefixCurrency: (value) =>
                set({
                    isPrefixCurrency: value,
                    updatedAt: utcNowString(),
                }),
            setIsExpenseOnlyMode: (value) =>
                set({
                    isExpenseOnlyMode: value,
                    updatedAt: utcNowString(),
                }),
            setIsCategoryAlphabetical: (value) =>
                set({
                    isCategoryAlphabetical: value,
                    updatedAt: utcNowString(),
                }),
            applyRemoteSettings: (
                customCurrency,
                isPrefixCurrency,
                isExpenseOnlyMode,
                isCategoryAlphabetical,
                updatedAt,
            ) =>
                set({
                    customCurrency,
                    isPrefixCurrency,
                    isExpenseOnlyMode,
                    isCategoryAlphabetical,
                    updatedAt,
                }),
        }),
        {
            name: PERSIST_PROFILE,
            partialize: (state) => ({
                customCurrency: state.customCurrency,
                isPrefixCurrency: state.isPrefixCurrency,
                isExpenseOnlyMode: state.isExpenseOnlyMode,
                isCategoryAlphabetical: state.isCategoryAlphabetical,
                updatedAt: state.updatedAt,
            }),
        },
    ),
);
