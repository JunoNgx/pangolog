"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DEVELOPER_WEBSITE, GITHUB_REPO } from "@/lib/constants";

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
    return (
        <div className="flex max-h-screen min-h-screen flex-col justify-center overflow-y-auto px-4 py-8">
            <div className="mx-auto flex max-h-screen max-w-lg flex-col gap-12 p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Pangolog
                        </h1>
                        <div className="border-l-2 pl-4">
                            <p className="text-foreground font-mono text-sm">
                                log
                            </p>
                            <p className="text-muted font-mono text-sm">
                                /lɔːɡ/ (verb)
                            </p>
                            <p className="text-muted font-mono text-sm">
                                To add an entry in a logbook
                            </p>
                        </div>
                    </div>
                    <p className="text-muted">
                        A minimalist, offline-first, and privacy-first personal
                        expense tracker.
                    </p>
                </div>

                <ul className="flex flex-col gap-6">
                    {FEATURES.map((feature) => (
                        <li key={feature.headline}>
                            <p className="text-foreground mb-2 font-semibold">
                                {feature.headline}
                            </p>
                            <p className="text-muted text-sm">{feature.body}</p>
                        </li>
                    ))}
                </ul>

                <div className="flex flex-col gap-2">
                    <Link
                        href="/log"
                        className="bg-accent text-accent-foreground border-foreground dark:border-background app-shadow-hard-sm inline-flex items-center justify-center gap-2 self-center rounded-lg border px-6 py-3 text-base font-medium hover:opacity-90"
                    >
                        Get started
                    </Link>
                    <p className="text-muted text-center text-xs">
                        (like, now; no account or signup needed)
                    </p>
                </div>

                <footer className="flex flex-col items-center gap-2">
                    <p className="text-muted text-sm">
                        by{" "}
                        <Link
                            href={DEVELOPER_WEBSITE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            Juno Nguyen
                        </Link>
                    </p>
                    <div className="flex items-center gap-3">
                        <Link
                            href={GITHUB_REPO}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                        >
                            Source
                        </Link>
                        <span className="text-muted text-sm">|</span>
                        <Link
                            href="/privacy"
                            className="text-sm text-blue-500 hover:underline"
                        >
                            Privacy Policy
                        </Link>
                        <span className="text-muted text-sm">|</span>
                        <Link
                            href="/terms"
                            className="text-sm text-blue-500 hover:underline"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
