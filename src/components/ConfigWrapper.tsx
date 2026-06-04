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
    return (
        <div className={`mx-auto w-full max-w-lg ${className}`}>{children}</div>
    );
}
