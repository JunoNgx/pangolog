interface KbdProps {
    children: React.ReactNode;
}

export function Kbd({ children }: KbdProps) {
    return (
        <kbd
            className={`
                /* CONTAINER */
                inline-block

                /* CONTENT STYLES */
                font-mono text-xs

                /* VISUAL EFFECTS */
                bg-default-100 border border-default-200 rounded px-1.5 py-0.5
            `}
        >
            {children}
        </kbd>
    );
}
