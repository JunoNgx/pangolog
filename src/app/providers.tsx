"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

function ThemeColorSync() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const color = resolvedTheme === "dark" ? "#000000" : "#ffffff";
        document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
            el.setAttribute("content", color);
        });
    }, [resolvedTheme]);

    return null;
}

function ThemedToaster() {
    const { resolvedTheme } = useTheme();
    return (
        <Toaster
            theme={resolvedTheme as "light" | "dark"}
            toastOptions={{ classNames: { toast: "font-mono" } }}
        />
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system">
                <HeroUIProvider>
                    {children}
                    <ThemeColorSync />
                    <ThemedToaster />
                </HeroUIProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
