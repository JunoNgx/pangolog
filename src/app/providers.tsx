"use client";

import { Toast } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useLayoutEffect, useState } from "react";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useLocalAppDataStore } from "@/lib/store/useLocalAppDataStore";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";
import { useLogViewSettingsStore } from "@/lib/store/useLogViewSettingsStore";
import { useSummaryViewSettingsStore } from "@/lib/store/useSummaryViewSettingsStore";

function ThemeColorSync() {
    useLayoutEffect(() => {
        function updateMetaThemeColor() {
            const tempEl = document.createElement("div");
            tempEl.style.backgroundColor = "var(--color-background-tertiary)";
            document.body.appendChild(tempEl);
            const cssThemeColor = getComputedStyle(tempEl).backgroundColor;
            document.body.removeChild(tempEl);

            const hasDarkClass =
                document.documentElement.classList.contains("dark");
            const fallbackColor = hasDarkClass ? "#000000" : "#ffffff";
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
        }

        updateMetaThemeColor();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "class"
                ) {
                    updateMetaThemeColor();
                    break;
                }
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

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
