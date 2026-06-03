"use client";

interface ChipLabelProps {
    children: React.ReactNode;
    className?: string;
}

export function ChipLabel({ children, className }: ChipLabelProps) {
    return (
        <span
            className={`mx-2 w-min self-center text-center font-mono text-xs ${className ?? ""}`}
        >
            {children}
        </span>
    );
}
