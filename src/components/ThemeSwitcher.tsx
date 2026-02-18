"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const CurrentIcon = themes.find((t) => t.key === theme)?.icon ?? Monitor;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button isIconOnly variant="light" size="sm" aria-label="Theme">
                <div className="size-4.5" />
            </Button>
        );
    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm" aria-label="Theme">
                    <CurrentIcon size={18} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Theme selection"
                selectionMode="single"
                selectedKeys={new Set([theme ?? "system"])}
                onSelectionChange={(keys) => {
                    const selected = [...keys][0] as string;
                    setTheme(selected);
                }}
            >
                {themes.map((t) => (
                    <DropdownItem
                        key={t.key}
                        startContent={<t.icon size={16} />}
                    >
                        {t.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
