interface KbdProps {
    children: React.ReactNode;
}

export function Kbd({ children }: KbdProps) {
    return (
        <kbd className="bg-default-100 border-default-200 inline-block rounded border px-1.5 py-0.5 font-mono text-xs">
            {children}
        </kbd>
    );
}
