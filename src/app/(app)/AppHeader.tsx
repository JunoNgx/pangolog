"use client";

import type { LucideIcon } from "lucide-react";
import { Feather, PieChart, Settings, SlidersHorizontal } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { label: "Log", href: "/log", icon: Feather },
    { label: "Summary", href: "/summary", icon: PieChart },
    { label: "Manage", href: "/manage", icon: SlidersHorizontal },
    { label: "Settings", href: "/settings", icon: Settings },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
    return (
        <NextLink
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
        >
            <item.icon size={15} />
            {item.label}
        </NextLink>
    );
}

export function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="bg-background z-40 hidden h-14 w-full items-center gap-2 border-b backdrop-blur-md md:flex">
            <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        item={item}
                        isActive={pathname === item.href}
                    />
                ))}
            </nav>
            <div className="ml-auto flex shrink-0 items-center gap-2">
                <ThemeSwitcher />
                <NextLink href="/" className="shrink-0 text-lg font-bold">
                    Pangolog
                </NextLink>
            </div>
        </header>
    );
}
