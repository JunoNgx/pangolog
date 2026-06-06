import { type RefObject, useEffect, useLayoutEffect, useState } from "react";
import { isAndroid } from "@/lib/utils";

// HeroUI v3 modals (React Aria FocusScope) auto-focus the first focusable element
// on mount before the enter animation settles, with no interface to opt out.
// On mobile browsers with a soft keyboard, this scrolls the modal to the wrong
// position. A focus sink div absorbs the initial focus, and this hook delays
// focusing the intended input until after the animation finishes.

// At the time of writing, only Android suffers from misbehaved scrolling;
// Safari's behaviour is acceptable. The workaround is only applicable to
// Android devices, upon detected.

interface UseDelayedAutoFocusOnAndroidOptions {
    isModalOpen: boolean;
    focusableElRef: RefObject<HTMLInputElement | null>;
}

export function useDelayedAutoFocusOnAndroid({
    isModalOpen,
    focusableElRef,
}: UseDelayedAutoFocusOnAndroidOptions) {
    const [isAndroidDevice, setIsAndroidDevice] = useState(false);

    useLayoutEffect(() => {
        if (isAndroid()) setIsAndroidDevice(true);
    }, []);

    const MODAL_ENTER_DELAY_MS = 250;

    useEffect(() => {
        if (!isModalOpen || !isAndroidDevice) return;
        const timeout = setTimeout(
            () => focusableElRef.current?.focus(),
            MODAL_ENTER_DELAY_MS,
        );
        return () => clearTimeout(timeout);
    }, [isModalOpen, focusableElRef, isAndroidDevice]);

    return { shouldAutoFocus: !isAndroidDevice };
}
