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

export default function PrivacyClient() {
    const router = useRouter();

    return (
        <div className="container mx-auto max-w-2xl px-4 pt-6 pb-24">
            <h1 className="text-xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-default-400 mb-8">
                Last updated: February 2026
            </p>

            <Section title="Overview">
                <p className="text-sm text-default-500">
                    Pangolog is an offline-first, privacy-first expense tracker.
                    Your financial data never leaves your device unless you
                    explicitly enable Google Drive sync, in which case it is
                    stored in your own Google Drive account - not on our
                    servers.
                </p>
            </Section>

            <Section title="Your data storage">
                <p className="text-sm text-default-500 mb-3">
                    We collect no personal data. All transaction records,
                    categories, and settings are stored locally in your
                    browser&apos;s IndexedDB storage on your device.
                </p>
                <p className="text-sm text-default-500">
                    If you connect to Google Drive, we store a short-lived session
                    token in an encrypted HTTP-only cookie solely to facilitate
                    token refresh. Your Google email address is stored locally
                    on your device and displayed in Settings. No data is
                    transmitted to or stored on Pangolog servers.
                </p>
            </Section>

            <Section title="Google Drive sync">
                <p className="text-sm text-default-500 mb-3">
                    Google Drive sync is entirely optional. When enabled, your
                    data is synced directly to a{" "}
                    <span className="font-mono text-xs">Pangolog/</span> folder
                    in your own Google Drive account. We request only the
                    minimum necessary OAuth scopes to read and write files
                    created by this app.
                </p>
                <p className="text-sm text-default-500">
                    You can disconnect Google Drive at any time from Settings.
                    Disconnecting removes our access to your Drive and deletes
                    the session cookie.
                </p>
            </Section>

            <Section title="Third-party services">
                <p className="text-sm text-default-500">
                    Pangolog uses Google Identity Services for OAuth
                    authentication and the Google Drive API for optional sync.
                    These interactions are governed by{" "}
                    <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-default-600"
                    >
                        Google&apos;s Privacy Policy
                    </a>
                    . We use no analytics, advertising, or other third-party
                    services.
                </p>
            </Section>

            <Section title="Data deletion">
                <p className="text-sm text-default-500">
                    To delete your local data, use the{" "}
                    <span className="font-mono text-xs">Reset all data</span>{" "}
                    option in Settings, or clear your browser&apos;s site data
                    for this app. To remove synced data, delete the{" "}
                    <span className="font-mono text-xs">Pangolog/</span> folder
                    from your Google Drive directly.
                </p>
            </Section>

            <Section title="Changes to this policy">
                <p className="text-sm text-default-500">
                    Any changes to this policy will be reflected on this page
                    with an updated date.
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
