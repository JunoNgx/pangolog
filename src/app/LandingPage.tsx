"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import type { ReactNode } from "react";

const FEATURES: { headline: string; body: ReactNode }[] = [
    {
        headline: "Built around how you spend",
        body: (
            <>
                Two flavours of expenses:{" "}
                <span className="text-sky-500">small dimes</span> for the daily
                small stuff, and{" "}
                <span className="text-amber-500">big bucks</span> for irregular
                and large purchases. Recurring bills, summary charts, and
                filters included.
            </>
        ),
    },
    {
        headline: "Made with care and respect",
        body: "Your data lives only on your device, and on your Google Drive only if you choose to. PWA-ready and fully functional without an internet connection. A healthy dose of keyboard shortcuts for productivity nerds.",
    },
    {
        headline: "Crafted with love",
        body: "Typical indie software. Free forever. Made for personal use first and fun second. Fork it or host it all you want. Zero data collection by design.",
    },
];

export default function LandingPage() {
    const containerClasses = `
        min-h-dvh max-w-lg mx-auto
        flex flex-col justify-center gap-12 p-8
    `;

    const hookClasses = `
        border-l-2 border-default-300
        pl-4
    `;

    const featureHeadlineClasses = `
        font-semibold text-default-700 mb-2
    `;

    const featureBodyClasses = `
        text-sm text-default-500
    `;

    const ctaSublineClasses = `
        text-xs text-default-400
    `;

    return (
        <div className={containerClasses}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Pangolog
                    </h1>
                    <div className={hookClasses}>
                        <p className="font-mono text-sm text-default-700">
                            log
                        </p>
                        <p className="font-mono text-sm text-default-400">
                            /lɔːɡ/ (verb)
                        </p>
                        <p className="font-mono text-sm text-default-500">
                            To add an entry in a logbook
                        </p>
                    </div>
                </div>
                <p className="text-default-500">
                    A minimalist, offline-first, and privacy-first personal
                    expense tracker.
                </p>
            </div>

            <ul className="flex flex-col gap-6">
                {FEATURES.map((feature) => (
                    <li key={feature.headline}>
                        <p className={featureHeadlineClasses}>
                            {feature.headline}
                        </p>
                        <p className={featureBodyClasses}>{feature.body}</p>
                    </li>
                ))}
            </ul>

            <div className="flex flex-col gap-2">
                <Button
                    as={Link}
                    href="/log"
                    color="primary"
                    size="lg"
                    className="self-center"
                >
                    Get started
                </Button>
                <p className={`${ctaSublineClasses} text-center`}>
                    (like, now; no account or signup needed)
                </p>
            </div>

            <footer className="flex flex-col items-center gap-2">
                <p className="text-xs text-default-400">
                    by{" "}
                    <Link
                        href="https://junongx.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-default-600"
                    >
                        Juno Nguyen
                    </Link>
                </p>
                <div className="flex items-center gap-3">
                    <Link
                        href="https://github.com/JunoNgx/pangolog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-default-400 hover:text-default-600"
                    >
                        Source
                    </Link>
                    <span className="text-xs text-default-300">|</span>
                    <Link
                        href="/privacy"
                        className="text-xs text-default-400 hover:text-default-600"
                    >
                        Privacy Policy
                    </Link>
                    <span className="text-xs text-default-300">|</span>
                    <Link
                        href="/terms"
                        className="text-xs text-default-400 hover:text-default-600"
                    >
                        Terms of Service
                    </Link>
                </div>
            </footer>
        </div>
    );
}
