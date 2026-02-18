import { SeedManager } from "@/components/SeedManager";
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
            <SeedManager />
            <AppNavbar />
            <main className="container mx-auto max-w-4xl px-4 py-6">
                {children}
            </main>
        </>
    );
}
