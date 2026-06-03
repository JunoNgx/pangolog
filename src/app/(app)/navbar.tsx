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

function NavLink({
    item,
    isActive,
    isDesktop,
}: {
    item: NavItem;
    isActive: boolean;
    isDesktop: boolean;
}) {
    const iconSize = isDesktop ? 15 : 20;

    const layoutClasses = isDesktop
        ? "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm"
        : "flex flex-1 flex-col items-center justify-center gap-1";

    const activeClasses = `bg-accent/10 text-accent${isDesktop ? "" : " rounded-lg"}`;
    const inactiveClasses = isDesktop
        ? "text-muted hover:bg-surface hover:text-foreground"
        : "text-muted";

    const label = isDesktop ? (
        item.label
    ) : (
        <span className="text-xs">{item.label}</span>
    );

    return (
        <NextLink
            key={item.href}
            href={item.href}
            className={`${layoutClasses} transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? "page" : undefined}
        >
            <item.icon size={iconSize} />
            {label}
        </NextLink>
    );
}

export function AppNavbar() {
    const pathname = usePathname();

    return (
        <>
            <header className="bg-background z-40 hidden border-b backdrop-blur-md md:flex">
                <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
                    <NextLink
                        href="/"
                        className="mr-6 shrink-0 text-lg font-bold"
                    >
                        Pangolog
                    </NextLink>
                    <nav className="ml-auto flex items-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                isActive={pathname === item.href}
                                isDesktop
                            />
                        ))}
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
            <nav className="bg-background fixed right-0 bottom-0 left-0 z-40 m-3 mt-0 mr-24 flex h-16 rounded-lg border md:hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        item={item}
                        isActive={pathname === item.href}
                        isDesktop={false}
                    />
                ))}
            </nav>
        </>
    );
}
