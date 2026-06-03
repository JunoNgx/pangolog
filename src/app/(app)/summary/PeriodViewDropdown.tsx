"use client";

import {
    Button,
    Dropdown,
    Label,
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
        if (!key) return;
        onViewChange(key === "yearly");
    }

    return (
        <Dropdown>
            <Button
                variant="outline"
                size="sm"
                isIconOnly
                aria-label={viewLabel}
            >
                <CurrentIcon size={16} />
            </Button>
            <Dropdown.Popover className="min-w-0 w-fit">
                <Dropdown.Menu
                    aria-label="Period view mode"
                    selectionMode="single"
                    selectedKeys={new Set([isYearly ? "yearly" : "monthly"])}
                    onSelectionChange={handleSelectionChange}
                >
                    {VIEW_OPTIONS.map((opt) => (
                        <Dropdown.Item
                            id={opt.key}
                            key={opt.key}
                            textValue={opt.label}
                        >
                            <opt.icon size={16} />
                            <Label>{opt.label}</Label>
                            <Dropdown.ItemIndicator />
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
