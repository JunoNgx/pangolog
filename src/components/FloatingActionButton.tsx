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
    return (
        <FloatingButtonContainer>
            <Tooltip delay={0}>
                <Button
                    variant="primary"
                    className="pointer-events-auto absolute right-4 bottom-0 h-14 w-14 min-w-0 rounded-full md:right-6 md:w-auto md:rounded-lg"
                    onPress={onPress}
                >
                    <Plus />
                    <span className="hidden md:inline">{label}</span>
                </Button>
                <Tooltip.Content placement="left" offset={7}>
                    <span className="text-center">Ctrl/Cmd + Enter</span>
                </Tooltip.Content>
            </Tooltip>
        </FloatingButtonContainer>
    );
}
