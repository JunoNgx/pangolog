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
    const baseClasses = `
        /* INNER STRUCTURE */
        flex flex-col

        /* CONTAINER */
        max-w-lg mx-auto pb-20
    `;

    return (
        <Component className={`${baseClasses} ${className ?? ""}`}>
            {children}
        </Component>
    );
}
