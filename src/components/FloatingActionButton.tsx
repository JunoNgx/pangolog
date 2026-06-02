"use client";

import { Button, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";
import { FloatingButtonContainer } from "@/components/FloatingButtonContainer";

interface FloatingActionButtonProps {
    label: string;
    onPress: () => void;
}

export function FloatingActionButton({
    label,
    onPress,
}: FloatingActionButtonProps) {
    const buttonClasses = `
        /* CONTAINER */
        absolute right-4 bottom-0
        h-14 min-w-0 rounded-full
        md:right-6 md:rounded-lg

        /* BEHAVIOUR */
        pointer-events-auto
    `;

    return (
        <FloatingButtonContainer>
            <Tooltip delay={0}>
                <Button
                    variant="primary"
                    className={buttonClasses}
                    onPress={onPress}
                >
                    <Plus />
                    <span className="hidden md:inline">{label}</span>
                </Button>
                <Tooltip.Content placement="left">
                    <span className="text-center">Ctrl/Cmd + Enter</span>
                </Tooltip.Content>
            </Tooltip>
        </FloatingButtonContainer>
    );
}
