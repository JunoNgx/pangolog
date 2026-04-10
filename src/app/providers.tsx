"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { useLocalAppDataStore } from "@/lib/store/useLocalAppDataStore";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { useLocalUserSettingsStore } from "@/lib/store/useLocalUserSettingsStore";

function ThemeColorSync() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (!resolvedTheme) return;
        const color = resolvedTheme === "dark" ? "#000000" : "#ffffff";
        let meta = document.querySelector(
            'meta[name="theme-color"]',
        ) as HTMLMetaElement | null;
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }
        meta.content = color;
    }, [resolvedTheme]);

    return null;
}

function ThemedToaster() {
    const { resolvedTheme } = useTheme();
    return (
        <Toaster
            theme={resolvedTheme as "light" | "dark"}
            toastOptions={{ classNames: { toast: "" } }}
            mobileOffset={{ bottom: "80px" }}
        />
    );
}

function StoreHydration() {
    useEffect(() => {
        useLocalSyncDataStore.persist.rehydrate();
        useLocalAppDataStore.persist.rehydrate();
        useLocalUserSettingsStore.persist.rehydrate();
    }, []);
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system">
                <HeroUIProvider>
                    {children}
                    <StoreHydration />
                    <ThemeColorSync />
                    <ThemedToaster />
                    <ServiceWorkerRegistration />
                </HeroUIProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
