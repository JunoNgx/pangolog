"use client";

import type { ReactNode } from "react";

interface FloatingButtonContainerProps {
    children: ReactNode;
}

export function FloatingButtonContainer({
    children,
}: FloatingButtonContainerProps) {
    const containerClasses = `
        /* CONTAINER */
        fixed inset-x-0 bottom-4 z-50
        max-w-3xl mx-auto
        md:bottom-6

        /* INNER STRUCTURE */
        pointer-events-none
    `;

    return <div className={containerClasses}>{children}</div>;
}
