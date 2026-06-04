"use client";

import { Button, Tooltip } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FloatingButtonContainer } from "@/components/FloatingButtonContainer";
import { useHotkey } from "@/lib/hooks/useHotkey";

export function FloatingBackButton() {
    const router = useRouter();
    const goBack = useCallback(() => router.back(), [router]);
    useHotkey("Escape", goBack);

    return (
        <FloatingButtonContainer>
            <Tooltip delay={0}>
                <Button
                    variant="tertiary"
                    className="pointer-events-auto absolute right-4 bottom-0 h-14 min-w-0 rounded-full md:right-6 md:rounded-lg"
                    onPress={goBack}
                >
                    <ArrowLeft />
                    <span className="hidden md:inline">Go back</span>
                </Button>
                <Tooltip.Content placement="left">Esc</Tooltip.Content>
            </Tooltip>
        </FloatingButtonContainer>
    );
}
