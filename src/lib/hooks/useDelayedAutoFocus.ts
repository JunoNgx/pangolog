import { type RefObject, useEffect } from "react";

// HeroUI v3 modals (React Aria FocusScope) auto-focus the first focusable element
// on mount before the enter animation settles, with no interface to opt out.
// On mobile browsers with a soft keyboard, this scrolls the modal to the wrong
// position. A focus sink div absorbs the initial focus, and this hook delays
// focusing the intended input until after the animation finishes.

// At the time of writing, only Android suffers from misbehaved scrolling;
// Safari's behaviour is acceptable. The workaround is only applicable to
// Android devices, upon detected.

export function useDelayedAutoFocus(
    isOpen: boolean,
    ref: RefObject<HTMLInputElement | null>,
    shouldApplyDelay: boolean = true,
) {
    const MODAL_ENTER_DELAY_MS = 250;

    useEffect(() => {
        if (!isOpen || !shouldApplyDelay) return;
        const timeout = setTimeout(
            () => ref.current?.focus(),
            MODAL_ENTER_DELAY_MS,
        );
        return () => clearTimeout(timeout);
    }, [isOpen, ref, shouldApplyDelay]);
}
