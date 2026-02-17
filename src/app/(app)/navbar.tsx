"use client";

import {
    Link,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
} from "@heroui/react";
import { usePathname } from "next/navigation";

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
                        <Link
                            href={item.href}
                            color={
                                pathname === item.href
                                    ? "primary"
                                    : "foreground"
                            }
                            aria-current={
                                pathname === item.href ? "page" : undefined
                            }
                        >
                            {item.label}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>
        </Navbar>
    );
}
