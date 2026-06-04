"use client";

import type { ElementType, ReactNode } from "react";

interface MainListContainerProps {
    as?: ElementType;
    className?: string;
    children: ReactNode;
}

export function MainListContainer({
    as: Component = "ul",
    className,
    children,
}: MainListContainerProps) {
    return (
        <Component
            className={`mx-auto flex max-w-lg flex-col pb-20 ${className ?? ""}`}
        >
            {children}
        </Component>
    );
}
