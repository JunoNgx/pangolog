import { CommandPalette } from "@/components/CommandPalette";
import { RecurringRulesManager } from "@/components/RecurringRulesManager";
import { SyncManager } from "@/components/SyncManager";
import { AppNavbar } from "./navbar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <SyncManager />
            <RecurringRulesManager />
            <CommandPalette />
            <AppNavbar />
            <main className="container mx-auto max-w-4xl px-4 pt-6 pb-24 md:pb-6">
                {children}
            </main>
        </>
    );
}
