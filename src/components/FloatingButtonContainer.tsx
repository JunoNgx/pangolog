"use client";

import type { ReactNode } from "react";

interface FloatingButtonContainerProps {
    children: ReactNode;
}

export function FloatingButtonContainer({
    children,
}: FloatingButtonContainerProps) {
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto md:bottom-6">
            {children}
        </div>
    );
}
