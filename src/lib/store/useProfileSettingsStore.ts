import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileSettingsStore {
    customCurrency: string;
    isPrefixCurrency: boolean;
    setCustomCurrency: (value: string) => void;
    setIsPrefixCurrency: (value: boolean) => void;
}

export const useProfileSettingsStore = create<ProfileSettingsStore>()(
    persist(
        (set) => ({
            customCurrency: "",
            isPrefixCurrency: true,
            setCustomCurrency: (value) => set({ customCurrency: value }),
            setIsPrefixCurrency: (value) => set({ isPrefixCurrency: value }),
        }),
        {
            name: "pangolog-profile-settings",
        },
    ),
);
