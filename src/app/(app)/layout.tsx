import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteHeader } from "@/components/RouteHeader";
import { RouteHeaderProvider } from "@/lib/context/RouteHeaderContext";
import { CommandPalette } from "./_components/CommandPalette";
import { RecurringRulesManager } from "./_components/RecurringRulesManager";
import { ShortcutsDialog } from "./_components/ShortcutsDialog";
import { SyncManager } from "./_components/SyncManager";
import { AppHeader } from "./AppHeader";
import { AppNavbar } from "./AppNavbar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const A11Y_FOCUS_STYLES =
        "outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:px-4 focus:py-2 focus:bg-background focus:text-foreground";

    return (
        <ErrorBoundary>
            <SyncManager />
            <RecurringRulesManager />
            <ShortcutsDialog>
                <button type="button" className={A11Y_FOCUS_STYLES}>
                    Open keyboard shortcuts (Ctrl/Cmd+/)
                </button>
            </ShortcutsDialog>
            <Suspense>
                <CommandPalette>
                    <button type="button" className={A11Y_FOCUS_STYLES}>
                        Open command palette (Ctrl/Cmd+K)
                    </button>
                </CommandPalette>
            </Suspense>
            <a href="#content-card" className={A11Y_FOCUS_STYLES}>
                Skip to main content
            </a>
            <div
                id="app-wrapper"
                className="md:h-app-wrapper m-auto flex h-screen max-w-3xl flex-col overflow-hidden"
            >
                <AppHeader />
                <div
                    id="main-panel"
                    className="m-b-2 bg-background-tertiary border-foreground flex flex-1 flex-col overflow-hidden border-0 p-2 pt-0 pb-8 md:rounded-b-xl md:border md:border-t-0 md:pb-2"
                >
                    <RouteHeaderProvider>
                        <RouteHeader />
                        <main
                            id="#content-card"
                            className="bg-background border-foreground max-h-full flex-1 overflow-y-scroll border border-b-0 px-4 pt-4 md:rounded-b-md md:border-b"
                        >
                            {children}
                        </main>
                        <AppNavbar isMobile />
                    </RouteHeaderProvider>
                </div>
            </div>
        </ErrorBoundary>
    );
}
