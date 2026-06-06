import { type RefObject, useEffect } from "react";

// HeroUI v3 modals (React Aria FocusScope) auto-focus the first focusable element
// on mount before the enter animation settles, with no interface to opt out.
// This scrolls the modal to the wrong position on mobile. A companion
// <FocusSink /> absorbs that initial focus so the modal stays in position.
// This hook then delays focusing the intended input until after the animation
// finishes. iOS Safari ignores programmatic .focus() outside a user gesture,
// so this hook is Android-only (controlled via shouldApplyDelayedFocus).

interface UseDelayedAutoFocusOptions {
    isOpen: boolean;
    ref: RefObject<HTMLInputElement | null>;
    shouldApplyDelayedFocus: boolean;
}

export function useDelayedAutoFocus({
    isOpen,
    ref,
    shouldApplyDelayedFocus,
}: UseDelayedAutoFocusOptions) {
    const MODAL_ENTER_DELAY_MS = 250;

    useEffect(() => {
        if (!isOpen || !shouldApplyDelayedFocus) return;
        const timeout = setTimeout(
            () => ref.current?.focus(),
            MODAL_ENTER_DELAY_MS,
        );
        return () => clearTimeout(timeout);
    }, [isOpen, ref, shouldApplyDelayedFocus]);
}
