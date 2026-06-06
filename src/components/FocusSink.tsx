// Dummy focusable element as a workaround autofocus dialog bugs
interface FocusSinkProps {
    isEnabled: boolean;
}

export function FocusSink({ isEnabled }: FocusSinkProps) {
    if (!isEnabled) return null;
    return <div tabIndex={-1} className="sr-only" aria-hidden="true" />;
}
