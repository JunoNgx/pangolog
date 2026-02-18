import Link from "next/link";
import { Button } from "@heroui/react";

export default function LandingPage() {
    const containerClasses = `
        min-h-dvh
        flex flex-col items-center justify-center gap-6 p-8
        font-mono
    `;

    return (
        <div className={containerClasses}>
            <h1 className="text-4xl font-bold tracking-tight">
                pangolog
            </h1>
            <p className="text-default-500 text-center">
                a minimal expense tracker
            </p>
            <Button
                as={Link}
                href="/log"
                color="primary"
                size="lg"
                className="mt-4 font-mono"
            >
                Get Started
            </Button>
        </div>
    );
}
