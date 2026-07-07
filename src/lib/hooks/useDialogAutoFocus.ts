import { type RefObject, useEffect, useLayoutEffect, useState } from "react";
import { isAndroid, isMobileDevice as isMobileDeviceCheck } from "@/lib/utils";

// Bug: Opening a modal dialog with an auto-focus input scrolls to the wrong
//      position on Android.
// Why: HeroUI v3 (React Aria FocusScope) focuses the first focusable element
//      on mount before the enter animation settles. On Android, the soft keyboard
//      appears immediately and scrolls the modal to an incorrect position.
//      Safari's behaviour is acceptable without the workaround.
// Fix: Android detection at mount gates the entire workaround. Only on Android
//      does the focus sink div absorb the initial auto-focus and the hook delay
//      focusing the intended input by 250ms. Other platforms skip both.
// Todo: Remove workaround when:
//       - Android browsers fix the scroll behaviour
//       - HeroUI's implementation improves and is more aligned with React Aria

// Edit mode on touch devices: auto-focus is also suppressed when editing an
// existing record. The target field is unknown, and a soft-keyboard pop-up on
// the first field is intrusive. New records still auto-focus since the first
// field is the natural starting point.

interface UseDialogAutoFocusOptions {
    isModalOpen: boolean;
    isEditing?: boolean;
    focusableElRef: RefObject<HTMLInputElement | null>;
}

export function useDialogAutoFocus({
    isModalOpen,
    isEditing = false,
    focusableElRef,
}: UseDialogAutoFocusOptions) {
    const [isAndroidDevice, setIsAndroidDevice] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useLayoutEffect(() => {
        if (isAndroid()) setIsAndroidDevice(true);
        if (isMobileDeviceCheck()) setIsMobileDevice(true);
    }, []);

    const MODAL_ENTER_DELAY_MS = 250;
    const isEditingOnMobile = isEditing && isMobileDevice;

    useEffect(() => {
        if (!isModalOpen || !isAndroidDevice || isEditingOnMobile) return;
        const timeout = setTimeout(
            () => focusableElRef.current?.focus(),
            MODAL_ENTER_DELAY_MS,
        );
        return () => clearTimeout(timeout);
    }, [isModalOpen, focusableElRef, isAndroidDevice]);

    return {
        shouldAutoFocus: !isAndroidDevice && !isEditingOnMobile,
    };
}
