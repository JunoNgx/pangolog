"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { seedData } from "@/lib/db/seed";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";

export function SeedManager() {
    const queryClient = useQueryClient();
    const hasHydrated = useLocalSettingsStore((state) => state.hasHydrated);
    const isSeeded = useLocalSettingsStore((state) => state.isSeeded);
    const setIsSeeded = useLocalSettingsStore((state) => state.setIsSeeded);

    useEffect(() => {
        if (!hasHydrated) return;
        if (isSeeded) return;

        setIsSeeded(true);
        seedData().then(() => {
            queryClient.invalidateQueries();
        });
    }, [hasHydrated, isSeeded, setIsSeeded, queryClient]);

    return null;
}
