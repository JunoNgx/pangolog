import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthToken } from "@/lib/auth/types";

interface LocalSettingsStore {
    authToken: AuthToken | null;
    setAuthToken: (token: AuthToken | null) => void;
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
    persist(
        (set) => ({
            authToken: null,
            setAuthToken: (token) => set({ authToken: token }),
        }),
        {
            name: "pangolog-local-settings",
        },
    ),
);
