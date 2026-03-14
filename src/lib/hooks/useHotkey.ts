import { useEffect } from "react";

export function useHotkey(
    key: string,
    callback: () => void,
    options?: { ctrlOrMeta?: boolean },
) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const activeEl = document.activeElement;
            if (
                activeEl instanceof HTMLInputElement ||
                activeEl instanceof HTMLTextAreaElement ||
                activeEl instanceof HTMLSelectElement ||
                (activeEl instanceof HTMLElement && activeEl.isContentEditable)
            )
                return;
            if (options?.ctrlOrMeta && !(e.metaKey || e.ctrlKey)) return;
            if (e.key !== key) return;

            e.preventDefault();
            callback();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [key, callback, options?.ctrlOrMeta]);
}
