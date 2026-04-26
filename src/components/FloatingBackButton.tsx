"use client";

import { Button, Tooltip } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useHotkey } from "@/lib/hooks/useHotkey";

export function FloatingBackButton() {
    const router = useRouter();
    const goBack = useCallback(() => router.back(), [router]);
    useHotkey("Escape", goBack);

    const buttonClasses = `
        /* CONTAINER */
        fixed bottom-6 right-6 z-50
        h-14 min-w-0
    `;

    return (
        <Tooltip content="Esc" placement="left">
            <Button color="default" className={buttonClasses} onPress={goBack}>
                <ArrowLeft />
                <span className="hidden md:inline">Go back</span>
            </Button>
        </Tooltip>
    );
}
