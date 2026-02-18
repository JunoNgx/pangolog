import { useEffect } from "react";

export function useHotkey(
    key: string,
    callback: () => void,
    options?: { ctrlOrMeta?: boolean },
) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (options?.ctrlOrMeta && !(e.metaKey || e.ctrlKey)) return;
            if (e.key !== key) return;

            e.preventDefault();
            callback();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [key, callback, options?.ctrlOrMeta]);
}
