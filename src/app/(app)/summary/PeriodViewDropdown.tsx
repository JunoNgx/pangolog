"use client";

import { Button, Dropdown, Label } from "@heroui/react";

interface PeriodViewDropdownProps {
    isYearly: boolean;
    onViewChange: (isYearly: boolean) => void;
}

const VIEW_OPTIONS: {
    key: string;
    label: string;
    icon: string;
}[] = [
    { key: "monthly", label: "Monthly", icon: "M" },
    { key: "yearly", label: "Yearly", icon: "Y" },
];

export function PeriodViewDropdown({
    isYearly,
    onViewChange,
}: PeriodViewDropdownProps) {
    const currentOption = VIEW_OPTIONS.find(
        (opt) => opt.key === (isYearly ? "yearly" : "monthly"),
    );
    const currentIcon = currentOption?.icon ?? "M";
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
                className="app-shadow-hard-sm"
            >
                <span className="text-sm font-bold">{currentIcon}</span>
            </Button>
            <Dropdown.Popover className="w-fit min-w-0">
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
                            <span className="text-sm font-bold">
                                {opt.icon}
                            </span>
                            <Label>{opt.label}</Label>
                            <Dropdown.ItemIndicator />
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
