"use client";

import { FloatingBackButton } from "@/components/FloatingBackButton";
import { Section } from "@/components/Section";

export default function TermsClient() {
    return (
        <>
            <h1 className="mb-2 text-xl font-bold">Terms of Service</h1>
            <p className="text-muted mb-8 text-sm">
                Last updated: February 2026
            </p>

            <Section title="Acceptance">
                <p className="text-muted text-sm">
                    By using Pangolog, you agree to these terms. If you do not
                    agree, please discontinue use.
                </p>
            </Section>

            <Section title="Use of the app">
                <p className="text-muted text-sm">
                    Pangolog is a personal expense tracking tool provided for
                    individual, non-commercial use. You are responsible for the
                    accuracy of the data you enter and for maintaining your own
                    backups.
                </p>
            </Section>

            <Section title="Google Drive">
                <p className="text-muted text-sm">
                    The optional Google Drive sync feature is subject to
                    Google&apos;s{" "}
                    <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline"
                    >
                        Terms of Service
                    </a>
                    . We are not responsible for data loss resulting from
                    changes to Google Drive access or availability.
                </p>
            </Section>

            <Section title="No warranty">
                <p className="text-muted text-sm">
                    Pangolog is provided &ldquo;as is&rdquo; without warranty of
                    any kind. We make no guarantees of uptime, data integrity,
                    or sync reliability. Use the export feature in Settings to
                    maintain your own backups.
                </p>
            </Section>

            <Section title="Limitation of liability">
                <p className="text-muted text-sm">
                    To the fullest extent permitted by law, we are not liable
                    for any loss of data, financial loss, or other damages
                    arising from your use of Pangolog.
                </p>
            </Section>

            <Section title="Changes to these terms">
                <p className="text-muted text-sm">
                    We may update these terms at any time. Continued use of the
                    app after changes constitutes acceptance of the updated
                    terms.
                </p>
            </Section>

            <FloatingBackButton />
        </>
    );
}
