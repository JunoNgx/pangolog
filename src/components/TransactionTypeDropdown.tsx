"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { Banknote, Coins, HandCoins } from "lucide-react";
import type { ViewDisplayMode } from "@/lib/types";

interface TransactionTypeDropdownProps {
    displayMode: ViewDisplayMode;
    setDisplayMode: (mode: ViewDisplayMode) => void;
}

const MODE_OPTIONS: {
    key: ViewDisplayMode;
    label: string;
    icon: LucideIcon;
}[] = [
    { key: "dimes", label: "Small Dimes", icon: Coins },
    { key: "bucks", label: "Big Bucks", icon: Banknote },
    { key: "all", label: "All", icon: HandCoins },
];

export function TransactionTypeDropdown({
    displayMode,
    setDisplayMode,
}: TransactionTypeDropdownProps) {
    const currentOption = MODE_OPTIONS.find((opt) => opt.key === displayMode);
    const CurrentIcon = currentOption?.icon ?? Coins;
    const modeLabel = currentOption?.label ?? "Small Dimes";

    function handleSelectionChange(keys: "all" | Set<React.Key>) {
        if (keys === "all") return;
        const key = Array.from(keys)[0] as ViewDisplayMode;
        if (!key) return;
        setDisplayMode(key);
    }

    return (
        <Dropdown>
            <Button
                variant="outline"
                size="sm"
                isIconOnly
                aria-label={modeLabel}
                className="app-shadow-hard-sm"
            >
                <CurrentIcon size={16} />
            </Button>
            <Dropdown.Popover className="w-fit min-w-0" placement="bottom end">
                <Dropdown.Menu
                    aria-label="Transaction type display mode"
                    selectionMode="single"
                    selectedKeys={new Set([displayMode])}
                    onSelectionChange={handleSelectionChange}
                >
                    {MODE_OPTIONS.map((opt) => (
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
