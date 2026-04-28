"use client";

import type { ReactNode } from "react";

interface StaticPageContainerProps {
    children: ReactNode;
}

export function StaticPageContainer({ children }: StaticPageContainerProps) {
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
