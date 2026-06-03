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

export function AppNavbar() {
    const pathname = usePathname();

    return (
        <>
            <header
                className={`bg-background z-40 hidden border-b backdrop-blur-md md:flex`}
            >
                <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
                    <NextLink
                        href="/"
                        className="mr-6 shrink-0 text-lg font-bold"
                    >
                        Pangolog
                    </NextLink>
                    <nav className="ml-auto flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <NextLink
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface hover:text-foreground"}`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <item.icon size={15} />
                                    {item.label}
                                </NextLink>
                            );
                        })}
                    </nav>
                    <div className="flex shrink-0 items-center gap-1">
                        <ThemeSwitcher />
                    </div>
                </div>
            </header>

            {/* On Firefox Android, focusing a dialog input scrolls it out of view
                above this fixed navbar. A potential fix: conditionally disable
                autoFocus on touch devices via a useIsPointerFine hook checking
                the (pointer: fine) media query. Not applied - the issue is
                intermittent and unconfirmed on other browsers. */}
            <nav
                className={`bg-background fixed right-0 bottom-0 left-0 z-40 m-3 mt-0 mr-24 flex h-16 rounded-lg border md:hidden`}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <NextLink
                            key={item.href}
                            href={item.href}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive ? "bg-primary/10 text-primary rounded-lg" : "text-muted"}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon size={20} />
                            <span className="text-xs">{item.label}</span>
                        </NextLink>
                    );
                })}
            </nav>
        </>
    );
}
