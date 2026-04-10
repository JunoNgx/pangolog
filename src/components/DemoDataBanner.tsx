"use client";

import { Button } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
            await queryClient.invalidateQueries({ queryKey: ["transactions"] });
            await queryClient.invalidateQueries({ queryKey: ["categories"] });
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
            className={`
                /* CONTAINER */
                w-fit sm:w-full max-w-lg mx-auto rounded-lg

                /* INNER STRUCTURE */
                flex flex-col sm:flex-row items-center sm:items-center gap-3 px-4 py-3

                /* VISUAL EFFECTS */
                border border-default-200 bg-default-50

                /* BEHAVIOR */
                mb-4
            `}
        >
            <p className="flex-1 text-sm text-default-600 text-center sm:text-left">
                New here? Have a taste and explore.
            </p>
            <div className="flex gap-2 shrink-0">
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    isLoading={isLoading}
                    onPress={handleLoadSampleData}
                >
                    Load sample data
                </Button>
                <Button
                    size="sm"
                    variant="light"
                    onPress={handleDismiss}
                    isDisabled={isLoading}
                >
                    Dismiss
                </Button>
            </div>
        </div>
    );
}
