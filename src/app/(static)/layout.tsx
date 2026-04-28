import type { ReactNode } from "react";

export default function StaticPageLayout({
    children,
}: {
    children: ReactNode;
}) {
    const baseClasses = `
        /* CONTAINER */
        container mx-auto flex-1 max-w-2xl overflow-y-auto px-4 pt-6 pb-24
    `;

    return (
        <div className="flex h-screen flex-col">
            <main className={baseClasses}>{children}</main>
        </div>
    );
}
