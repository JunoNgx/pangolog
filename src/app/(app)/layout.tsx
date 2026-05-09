import { Suspense } from "react";
import { CommandPalette } from "./_components/CommandPalette";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RecurringRulesManager } from "./_components/RecurringRulesManager";
import { ShortcutsDialog } from "./_components/ShortcutsDialog";
import { SyncManager } from "./_components/SyncManager";
import { AppNavbar } from "./navbar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ErrorBoundary>
            <SyncManager />
            <RecurringRulesManager />
            <Suspense>
                <CommandPalette />
                <ShortcutsDialog />
            </Suspense>
            <a
                href="#main-content"
                className="focus:bg-background focus:text-foreground focus:border-default-300 focus:ring-primary sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:border focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
            >
                Skip to main content
            </a>
            <div className="flex h-screen flex-col">
                <AppNavbar />
                <main
                    id="main-content"
                    className="container mx-auto max-w-3xl flex-1 overflow-y-auto px-4 pt-6 pb-24 md:pb-6"
                >
                    {children}
                </main>
            </div>
        </ErrorBoundary>
    );
}
