"use client";

import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mb-8">
            <h2 className="text-base font-semibold mb-3 text-default-700">
                {title}
            </h2>
            {children}
        </section>
    );
}

export default function TermsClient() {
    const router = useRouter();

    return (
        <div className="container mx-auto max-w-2xl px-4 pt-6 pb-24">
            <h1 className="text-xl font-bold mb-2">Terms of Service</h1>
            <p className="text-sm text-default-400 mb-8">
                Last updated: February 2026
            </p>

            <Section title="Acceptance">
                <p className="text-sm text-default-500">
                    By using Pangolog, you agree to these terms. If you do not
                    agree, please discontinue use.
                </p>
            </Section>

            <Section title="Use of the app">
                <p className="text-sm text-default-500">
                    Pangolog is a personal expense tracking tool provided for
                    individual, non-commercial use. You are responsible for the
                    accuracy of the data you enter and for maintaining your own
                    backups.
                </p>
            </Section>

            <Section title="Google Drive">
                <p className="text-sm text-default-500">
                    The optional Google Drive sync feature is subject to
                    Google&apos;s{" "}
                    <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-default-600"
                    >
                        Terms of Service
                    </a>
                    . We are not responsible for data loss resulting from
                    changes to Google Drive access or availability.
                </p>
            </Section>

            <Section title="No warranty">
                <p className="text-sm text-default-500">
                    Pangolog is provided &ldquo;as is&rdquo; without warranty of
                    any kind. We make no guarantees of uptime, data integrity,
                    or sync reliability. Use the export feature in Settings to
                    maintain your own backups.
                </p>
            </Section>

            <Section title="Limitation of liability">
                <p className="text-sm text-default-500">
                    To the fullest extent permitted by law, we are not liable
                    for any loss of data, financial loss, or other damages
                    arising from your use of Pangolog.
                </p>
            </Section>

            <Section title="Changes to these terms">
                <p className="text-sm text-default-500">
                    We may update these terms at any time. Continued use of the
                    app after changes constitutes acceptance of the updated
                    terms.
                </p>
            </Section>

            <Button
                color="default"
                className="fixed bottom-6 right-6 z-50 h-14 min-w-0"
                onPress={() => router.back()}
            >
                <ArrowLeft />
                <span className="hidden md:inline">Go back</span>
            </Button>
        </div>
    );
}
