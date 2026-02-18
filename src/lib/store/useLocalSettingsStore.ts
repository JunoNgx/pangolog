import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthToken } from "@/lib/auth/types";

interface LocalSettingsStore {
    authToken: AuthToken | null;
    setAuthToken: (token: AuthToken | null) => void;
    driveFolderId: string | null;
    setDriveFolderId: (id: string | null) => void;
}

export const useLocalSettingsStore = create<LocalSettingsStore>()(
    persist(
        (set) => ({
            authToken: null,
            setAuthToken: (token) => set({ authToken: token }),
            driveFolderId: null,
            setDriveFolderId: (id) => set({ driveFolderId: id }),
        }),
        {
            name: "pangolog-local-settings",
        },
    ),
);
