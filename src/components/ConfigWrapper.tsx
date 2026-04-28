"use client";

import type { ReactNode } from "react";

interface ConfigWrapperProps {
    children: ReactNode;
    className?: string;
}

export function ConfigWrapper({
    children,
    className = "",
}: ConfigWrapperProps) {
    const baseClasses = `
        /* CONTAINER */
        mx-auto w-full max-w-lg
    `;

    return <div className={`${baseClasses} ${className}`}>{children}</div>;
}
