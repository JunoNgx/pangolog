"use client";

import { Button } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CATEGORIES_KEY, TRANSACTIONS_KEY } from "@/lib/constants";
import { seedDemoData } from "@/lib/db/demo";
import { useLocalAppDataStore } from "@/lib/store/useLocalAppDataStore";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

export function DemoDataBanner() {
    const queryClient = useQueryClient();
    const {
        hasHydrated,
        shouldShowDemoDataBanner,
        setShouldShowDemoDataBanner,
    } = useLocalAppDataStore();
    const [isLoading, setIsLoading] = useState(false);

    if (!hasHydrated || !shouldShowDemoDataBanner) return null;

    async function handleLoadSampleData() {
        setIsLoading(true);
        try {
            await seedDemoData();
            useProfileSettingsStore.getState().setCustomCurrency("réal");
            useProfileSettingsStore.getState().setIsPrefixCurrency(false);
            await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
            await queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
            setShouldShowDemoDataBanner(false);
        } finally {
            setIsLoading(false);
        }
    }

    function handleDismiss() {
        setShouldShowDemoDataBanner(false);
    }

    return (
        <div
            className={`/* CONTAINER */ /* INNER STRUCTURE */ /* VISUAL EFFECTS */ border-default-200 bg-default-50 /* BEHAVIOR */ mx-auto mb-4 flex w-fit max-w-lg flex-col items-center gap-3 rounded-lg border px-4 py-3 sm:w-full sm:flex-row sm:items-center`}
        >
            <p className="text-default-600 flex-1 text-center text-sm sm:text-left">
                New here? Have a taste and explore.
            </p>
            <div className="flex shrink-0 gap-2">
                <Button
                    size="sm"
                    variant="primary"
                    isPending={isLoading}
                    onPress={handleLoadSampleData}
                >
                    Load sample data
                </Button>
                <Button
                    size="sm"
                    variant="tertiary"
                    onPress={handleDismiss}
                    isDisabled={isLoading}
                >
                    Dismiss
                </Button>
            </div>
        </div>
    );
}
