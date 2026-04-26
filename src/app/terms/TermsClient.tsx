"use client";

import { Button, Tooltip } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useHotkey } from "@/lib/hooks/useHotkey";

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="InfoSection">
            <h2 className="InfoSectionTitle">{title}</h2>
            {children}
        </section>
    );
}

export default function TermsClient() {
    const router = useRouter();
    const goBack = useCallback(() => router.back(), [router]);
    useHotkey("Escape", goBack);

    return (
        <div className="PageContainerNarrow">
            <h1 className="text-xl font-bold mb-2">Terms of Service</h1>
            <p className="Caption mb-8">Last updated: February 2026</p>

            <Section title="Acceptance">
                <p className="BodyText">
                    By using Pangolog, you agree to these terms. If you do not
                    agree, please discontinue use.
                </p>
            </Section>

            <Section title="Use of the app">
                <p className="BodyText">
                    Pangolog is a personal expense tracking tool provided for
                    individual, non-commercial use. You are responsible for the
                    accuracy of the data you enter and for maintaining your own
                    backups.
                </p>
            </Section>

            <Section title="Google Drive">
                <p className="BodyText">
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
                <p className="BodyText">
                    Pangolog is provided &ldquo;as is&rdquo; without warranty of
                    any kind. We make no guarantees of uptime, data integrity,
                    or sync reliability. Use the export feature in Settings to
                    maintain your own backups.
                </p>
            </Section>

            <Section title="Limitation of liability">
                <p className="BodyText">
                    To the fullest extent permitted by law, we are not liable
                    for any loss of data, financial loss, or other damages
                    arising from your use of Pangolog.
                </p>
            </Section>

            <Section title="Changes to these terms">
                <p className="BodyText">
                    We may update these terms at any time. Continued use of the
                    app after changes constitutes acceptance of the updated
                    terms.
                </p>
            </Section>

            <Tooltip content="Esc" placement="left">
                <Button
                    color="default"
                    className="FloatingBackButton"
                    onPress={() => router.back()}
                >
                    <ArrowLeft />
                    <span className="hidden md:inline">Go back</span>
                </Button>
            </Tooltip>
        </div>
    );
}
