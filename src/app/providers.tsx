"use client";

import { Toast } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useLocalAppDataStore } from "@/lib/store/useLocalAppDataStore";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useLogViewSettingsStore } from "@/lib/store/useLogViewSettingsStore";
import { useSummaryViewSettingsStore } from "@/lib/store/useSummaryViewSettingsStore";

function ThemeColorSync() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (!resolvedTheme) return;
        const root = document.documentElement;
        const cssThemeColor = getComputedStyle(root)
            .getPropertyValue("--color-background-tertiary")
            .trim();
        const fallbackColor = resolvedTheme === "dark" ? "#000000" : "#ffffff";
        const metaThemeColor = cssThemeColor || fallbackColor;
        let meta = document.querySelector(
            'meta[name="theme-color"]',
        ) as HTMLMetaElement | null;
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }
        meta.content = metaThemeColor;
    }, [resolvedTheme]);

    return null;
}

function ToastProvider() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    return <Toast.Provider placement={isDesktop ? "bottom" : "top"} />;
}

function StoreHydration() {
    useEffect(() => {
        useLocalSyncDataStore.persist.rehydrate();
        useLocalAppDataStore.persist.rehydrate();
        useLocalUserSettingsStore.persist.rehydrate();
        useLogViewSettingsStore.persist.rehydrate();
        useSummaryViewSettingsStore.persist.rehydrate();
    }, []);
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system">
                {children}
                <StoreHydration />
                <ThemeColorSync />
                <ToastProvider />
                <ServiceWorkerRegistration />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
