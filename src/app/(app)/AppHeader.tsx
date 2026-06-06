"use client";

import NextLink from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AppNavbar } from "./AppNavbar";

export function AppHeader() {
    return (
        <header className="bg-background z-40 hidden h-14 w-full items-center gap-2 border-b backdrop-blur-md md:flex">
            <AppNavbar />
            <div className="ml-auto flex shrink-0 items-center gap-2">
                <ThemeSwitcher />
                <NextLink href="/" className="shrink-0 text-lg font-bold">
                    Pangolog
                </NextLink>
            </div>
        </header>
    );
}
