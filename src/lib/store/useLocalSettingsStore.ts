import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocalSettingsStore {
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
    persist(
        (set) => ({
        }),
        {
            name: "pangolog-local-settings",
        },
    ),
);
