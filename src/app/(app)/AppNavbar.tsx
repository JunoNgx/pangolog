"use client";

import { Feather, PieChart, Settings, SlidersHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/types";
import { NavLinkDesktop } from "./_components/NavLinkDesktop";

const NAV_ITEMS: NavItem[] = [
    { label: "Log", href: "/log", icon: Feather },
    { label: "Summary", href: "/summary", icon: PieChart },
    { label: "Manage", href: "/manage", icon: SlidersHorizontal },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function AppNavbar() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
                <NavLinkDesktop
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                />
            ))}
        </nav>
    );
}
