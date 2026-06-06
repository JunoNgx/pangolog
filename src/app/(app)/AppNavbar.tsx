"use client";

import { Feather, PieChart, Settings, SlidersHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/types";
import { NavLinkDesktop } from "./_components/NavLinkDesktop";
import { NavLinkMobile } from "./_components/NavLinkMobile";

const NAV_ITEMS: NavItem[] = [
    { label: "Log", href: "/log", icon: Feather },
    { label: "Summary", href: "/summary", icon: PieChart },
    { label: "Manage", href: "/manage", icon: SlidersHorizontal },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function AppNavbar({ isMobile }: { isMobile?: boolean }) {
    const pathname = usePathname();
    const NavLink = isMobile ? NavLinkMobile : NavLinkDesktop;
    const visibilityClasses = isMobile ? "flex md:hidden" : "hidden md:flex";
    const layoutClasses = isMobile ? "border-b" : "border-t";

    return (
        <nav
            className={`${visibilityClasses} ${layoutClasses} divide-foreground border-foreground items-center divide-x border-r border-l`}
        >
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                />
            ))}
        </nav>
    );
}
