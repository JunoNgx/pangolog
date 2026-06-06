"use client";

import type { ReactNode } from "react";

interface FloatingButtonContainerProps {
    children: ReactNode;
}

export function FloatingButtonContainer({
    children,
}: FloatingButtonContainerProps) {
    return (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 px-4 md:bottom-6">
            {children}
        </div>
    );
}
