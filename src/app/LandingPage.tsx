"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

const FEATURES = [
    {
        headline: "Built around human life",
        points: [
            "Small dimes: small and daily expenses",
            "Big bucks: irregular and large purchases",
            "Barebones and does only what it should",
        ],
    },
    {
        headline: "Privacy-first and offline-first",
        points: [
            "Data lives only on your device, and optionally on your Google Drive",
            "PWA-ready and works without an internet connection",
            "Zero data collection",
        ],
    },
    {
        headline: "Free and open-source",
        points: [
            "Made by indie developer for fun",
            "Free forever",
            "Fork or host it yourself",
        ],
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

    const featurePointClasses = `
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
                        <ul className="flex flex-col gap-1 list-disc pl-4">
                            {feature.points.map((point) => (
                                <li key={point} className={featurePointClasses}>
                                    {point}
                                </li>
                            ))}
                        </ul>
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
        </div>
    );
}
