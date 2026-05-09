"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { Calendar1, CalendarDays } from "lucide-react";

interface PeriodViewDropdownProps {
    isYearly: boolean;
    onViewChange: (isYearly: boolean) => void;
}

const VIEW_OPTIONS: {
    key: string;
    label: string;
    icon: LucideIcon;
}[] = [
    { key: "monthly", label: "Monthly", icon: Calendar1 },
    { key: "yearly", label: "Yearly", icon: CalendarDays },
];

export function PeriodViewDropdown({
    isYearly,
    onViewChange,
}: PeriodViewDropdownProps) {
    const currentOption = VIEW_OPTIONS.find(
        (opt) => opt.key === (isYearly ? "yearly" : "monthly"),
    );
    const CurrentIcon = currentOption?.icon ?? Calendar1;
    const viewLabel = currentOption?.label ?? "Monthly";

    function handleSelectionChange(keys: "all" | Set<React.Key>) {
        if (keys === "all") return;
        const key = Array.from(keys)[0] as string;
        onViewChange(key === "yearly");
    }

    return (
        <Dropdown
            classNames={{
                content: "min-w-0 w-fit",
            }}
        >
            <DropdownTrigger>
                <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    aria-label={viewLabel}
                    title="Ctrl/Cmd+Shift+Y"
                >
                    <CurrentIcon size={16} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Period view mode"
                selectionMode="single"
                selectedKeys={new Set([isYearly ? "yearly" : "monthly"])}
                onSelectionChange={handleSelectionChange}
            >
                {VIEW_OPTIONS.map((opt) => (
                    <DropdownItem
                        key={opt.key}
                        startContent={<opt.icon size={16} />}
                    >
                        {opt.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
