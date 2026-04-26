"use client";

import { Button, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
    label: string;
    onPress: () => void;
}

export function FloatingActionButton({
    label,
    onPress,
}: FloatingActionButtonProps) {
    const containerClasses = `
        /* CONTAINER */
        fixed inset-x-0 bottom-4 z-50
        max-w-5xl mx-auto
        md:bottom-6

        /* INNER STRUCTURE */
        pointer-events-none
    `;

    const buttonClasses = `
        /* CONTAINER */
        absolute right-4 bottom-0
        h-14 min-w-0 rounded-full
        md:right-6 md:rounded-lg

        /* BEHAVIOUR */
        pointer-events-auto
    `;

    return (
        <div className={containerClasses}>
            <Tooltip
                content={<span className="text-center">Ctrl/Cmd + Enter</span>}
                placement="left"
            >
                <Button
                    color="primary"
                    className={buttonClasses}
                    onPress={onPress}
                >
                    <Plus />
                    <span className="hidden md:inline">{label}</span>
                </Button>
            </Tooltip>
        </div>
    );
}
