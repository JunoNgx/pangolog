"use client";

import { useState } from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Navbar
            maxWidth="lg"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
        >
            <NavbarBrand>
                <span className="font-mono font-bold text-lg">Pangolog</span>
            </NavbarBrand>
            <NavbarContent className="hidden md:flex" justify="end">
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
            <NavbarContent className="md:hidden" justify="end">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                />
            </NavbarContent>
            <NavbarMenu>
                {navItems.map((item) => (
                    <NavbarMenuItem key={item.href}>
                        <NextLink
                            href={item.href}
                            className={`
                                w-full text-lg
                                ${pathname === item.href ? "text-primary" : "text-foreground"}
                            `}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.label}
                        </NextLink>
                    </NavbarMenuItem>
                ))}
                <NavbarMenuItem>
                    <ThemeSwitcher />
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}
