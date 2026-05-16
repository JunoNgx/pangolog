import { useLayoutEffect, useRef } from "react";

export function useHotkey(
    key: string,
    callback: () => void,
    options?: { hasMod?: boolean; hasShift?: boolean },
) {
    const callbackRef = useRef(callback);
    const optionsRef = useRef(options);

    callbackRef.current = callback;
    optionsRef.current = options;

    useLayoutEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const activeEl = document.activeElement;
            if (
                activeEl instanceof HTMLInputElement ||
                activeEl instanceof HTMLTextAreaElement ||
                activeEl instanceof HTMLSelectElement ||
                (activeEl instanceof HTMLElement && activeEl.isContentEditable)
            )
                return;
            if (optionsRef.current?.hasMod && !(e.metaKey || e.ctrlKey))
                return;
            if (optionsRef.current?.hasShift && !e.shiftKey) return;
            if (e.key !== key) return;

            e.preventDefault();
            callbackRef.current();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [key]);
}
