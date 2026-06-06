import type { ReactNode } from "react";

interface LinkButtonProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export function LinkButton({
    href,
    children,
    className = "",
}: LinkButtonProps) {
    return (
        <a
            href={href}
            className={`bg-surface text-muted hover:text-foreground hover:bg-surface-secondary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${className}`}
        >
            {children}
        </a>
    );
}
