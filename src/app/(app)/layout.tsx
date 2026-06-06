import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CommandPalette } from "./_components/CommandPalette";
import { RecurringRulesManager } from "./_components/RecurringRulesManager";
import { ShortcutsDialog } from "./_components/ShortcutsDialog";
import { SyncManager } from "./_components/SyncManager";
import { AppNavbar } from "./navbar";

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
            <a href="#main-content" className={A11Y_FOCUS_STYLES}>
                Skip to main content
            </a>
            <div className="m-auto flex h-screen max-w-3xl flex-col">
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
