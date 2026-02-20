"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export default function LandingPage() {
    const containerClasses = `
        min-h-dvh
        flex flex-col items-center justify-center gap-6 p-8
    `;

    return (
        <div className={containerClasses}>
            <h1 className="text-4xl font-bold tracking-tight">pangolog</h1>
            <p className="text-default-500 text-center">
                an offine-first and privacy-first minimalist expense tracker
            </p>
            <Button
                as={Link}
                href="/log"
                color="primary"
                size="lg"
                className="mt-4"
            >
                Get Started
            </Button>
        </div>
    );
}
