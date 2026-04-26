"use client";

interface ChipLabelProps {
    children: React.ReactNode;
    className?: string;
}

export function ChipLabel({ children, className }: ChipLabelProps) {
    const baseClasses = `
        /* CONTAINER */
        w-min mx-2

        /* INNER STRUCTURE */
        self-center

        /* CONTENT STYLES */
        font-mono text-center text-xs
    `;

    return (
        <span className={`${baseClasses} ${className ?? ""}`}>{children}</span>
    );
}
