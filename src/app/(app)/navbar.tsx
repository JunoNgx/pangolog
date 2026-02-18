"use client";

import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
} from "@heroui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const navItems = [
    { label: "Log", href: "/log" },
    { label: "Categories", href: "/categories" },
    { label: "Summary", href: "/summary" },
    { label: "Settings", href: "/settings" },
];

export function AppNavbar() {
    const pathname = usePathname();

    return (
        <Navbar maxWidth="lg">
            <NavbarBrand>
                <span className="font-mono font-bold text-lg">Pangolog</span>
            </NavbarBrand>
            <NavbarContent justify="end">
                {navItems.map((item) => (
                    <NavbarItem key={item.href}>
                        <NextLink
                            href={item.href}
                            className={
                                pathname === item.href
                                    ? "text-primary"
                                    : "text-foreground"
                            }
                            aria-current={
                                pathname === item.href ? "page" : undefined
                            }
                        >
                            {item.label}
                        </NextLink>
                    </NavbarItem>
                ))}
                <NavbarItem>
                    <ThemeSwitcher />
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
