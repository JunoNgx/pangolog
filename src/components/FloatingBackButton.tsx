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
                    variant="outline"
                    className="pointer-events-auto absolute right-4 bottom-4 h-14 w-14 md:w-auto min-w-0 rounded-full md:rounded-lg bg-background"
                    onPress={goBack}
                >
                    <ArrowLeft />
                    <span className="hidden md:inline">Go back</span>
                </Button>
                <Tooltip.Content placement="left" offset={7}>
                    Esc
                </Tooltip.Content>
            </Tooltip>
        </FloatingButtonContainer>
    );
}
