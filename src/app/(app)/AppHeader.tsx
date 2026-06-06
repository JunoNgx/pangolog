"use client";

import NextLink from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AppNavbar } from "./AppNavbar";

export function AppHeader() {
    return (
        <header className="z-40 mt-4 hidden w-full items-end md:flex">
            <AppNavbar />
            <div className="border-b-foreground flex flex-1 shrink-0 items-center justify-end gap-2 border-b pb-1">
                <ThemeSwitcher />
                <NextLink href="/" className="shrink-0 text-lg font-bold">
                    Pangolog
                </NextLink>
            </div>
        </header>
    );
}
