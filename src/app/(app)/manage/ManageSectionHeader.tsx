import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

interface ManageSectionHeaderProps {
    title: string;
    createLabel: string;
    onCreate: () => void;
    children: ReactNode;
}

export function ManageSectionHeader({
    title,
    createLabel,
    onCreate,
    children,
}: ManageSectionHeaderProps) {
    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button variant="outline" onPress={onCreate}>
                    <Plus />
                    <span>{createLabel}</span>
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}
