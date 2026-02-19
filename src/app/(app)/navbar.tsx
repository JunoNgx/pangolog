"use client";

import type { LucideIcon } from "lucide-react";
import { PieChart, ScrollText, Settings, Tag } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { SyncStatusDot } from "@/components/SyncStatusDot";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { label: "Log", href: "/log", icon: ScrollText },
    { label: "Categories", href: "/categories", icon: Tag },
    { label: "Summary", href: "/summary", icon: PieChart },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function AppNavbar() {
    const pathname = usePathname();

    return (
        <>
            <header
                className={`
                    sticky top-0 z-40
                    hidden md:flex items-center h-14 px-6 gap-2
                    bg-background/80 backdrop-blur-md
                    border-b border-default-200
                `}
            >
                <NextLink
                    href="/"
                    className="font-mono font-bold text-lg mr-6 shrink-0"
                >
                    Pangolog
                </NextLink>
                <nav className="flex items-center gap-1 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const linkClass = `
                            flex items-center gap-2 px-3 py-1.5 rounded-md
                            text-sm font-mono
                            transition-colors
                            ${isActive ? "bg-primary/10 text-primary" : "text-default-500 hover:bg-default-100 hover:text-foreground"}
                        `;
                        return (
                            <NextLink
                                key={item.href}
                                href={item.href}
                                className={linkClass}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <item.icon size={15} />
                                {item.label}
                            </NextLink>
                        );
                    })}
                </nav>
                <div className="flex items-center gap-1 shrink-0">
                    <SyncStatusDot />
                    <ThemeSwitcher />
                </div>
            </header>

            <nav
                className={`
                    fixed bottom-0 left-0 right-0 z-40
                    md:hidden flex h-16
                    bg-background
                    border-t border-default-200
                `}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const itemClass = `
                        flex flex-col items-center justify-center flex-1 gap-1
                        transition-colors
                        ${isActive ? "text-primary" : "text-default-400"}
                    `;
                    return (
                        <NextLink
                            key={item.href}
                            href={item.href}
                            className={itemClass}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon size={20} />
                            <span className="text-xs font-mono">
                                {item.label}
                            </span>
                        </NextLink>
                    );
                })}
            </nav>
        </>
    );
}
