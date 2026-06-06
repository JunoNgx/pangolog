import { type RefObject, useEffect } from "react";

// HeroUI v3 modals (React Aria FocusScope) auto-focus the first focusable element
// on mount before the enter animation settles, with no interface to opt out.
// On mobile browsers with a soft keyboard, this scrolls the modal to the wrong
// position. A focus sink div absorbs the initial focus, and this hook delays
// focusing the intended input until after the animation finishes.

function isIos(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function useDelayedAutoFocus(
    isOpen: boolean,
    ref: RefObject<HTMLInputElement | null>,
) {
    const MODAL_ENTER_DELAY_MS = 250;

    useEffect(() => {
        if (!isOpen) return;
        // iOS Safari does not show the soft keyboard for programmatic .focus()
        // called outside a user gesture. Skip auto-focus entirely to avoid the
        // misleading state where the input is focused but the keyboard is hidden.
        if (isIos()) return;
        const timeout = setTimeout(
            () => ref.current?.focus(),
            MODAL_ENTER_DELAY_MS,
        );
        return () => clearTimeout(timeout);
    }, [isOpen, ref]);
}
