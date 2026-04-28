"use client";

import type { ReactNode } from "react";

interface StaticPageContainerProps {
    children: ReactNode;
}

export function StaticPageContainer({ children }: StaticPageContainerProps) {
    return (
        <div className="flex h-screen flex-col">
            <main className="container mx-auto max-w-2xl flex-1 overflow-y-auto px-4 pt-6 pb-24">
                {children}
            </main>
        </div>
    );
}
