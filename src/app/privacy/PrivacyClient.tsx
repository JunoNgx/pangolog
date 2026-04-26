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

export default function PrivacyClient() {
    const router = useRouter();
    const goBack = useCallback(() => router.back(), [router]);
    useHotkey("Escape", goBack);

    return (
        <div className="PageContainerNarrow">
            <h1 className="text-xl font-bold mb-2">Privacy Policy</h1>
            <p className="Caption mb-8">Last updated: March 2026</p>

            <Section title="Overview">
                <p className="BodyText">
                    Pangolog is an offline-first, privacy-first expense tracker.
                    Your financial data never leaves your device unless you
                    explicitly enable Google Drive sync, in which case it is
                    stored in your own Google Drive account - not on our
                    servers.
                </p>
            </Section>

            <Section title="Your data storage">
                <p className="BodyTextBlock">
                    We collect no personal data. All transaction records,
                    categories, and settings are stored locally in your
                    browser&apos;s IndexedDB storage on your device.
                </p>
                <p className="BodyText">
                    If you connect to Google Drive, we store a session token in
                    an encrypted HTTP-only cookie (valid for 30 days) solely to
                    facilitate token refresh. Your Google email address is
                    stored locally on your device and displayed in Settings. No
                    data is transmitted to or stored on Pangolog servers.
                </p>
            </Section>

            <Section title="Google Drive sync">
                <p className="BodyTextBlock">
                    Google Drive sync is entirely optional. When enabled, your
                    data is synced directly to a{" "}
                    <span className="MonoText">Pangolog/</span> folder in your
                    own Google Drive account. We request only the minimum
                    necessary OAuth scopes to read and write files created by
                    this app.
                </p>
                <p className="BodyText">
                    You can disconnect Google Drive at any time from Settings.
                    Disconnecting removes our access to your Drive and deletes
                    the session cookie.
                </p>
            </Section>

            <Section title="Third-party services">
                <p className="BodyText">
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
                <p className="BodyText">
                    To delete your local data, use the{" "}
                    <span className="MonoText">Reset all data</span> option in
                    Settings, or clear your browser&apos;s site data for this
                    app. To remove synced data, delete the{" "}
                    <span className="MonoText">Pangolog/</span> folder from your
                    Google Drive directly.
                </p>
            </Section>

            <Section title="Changes to this policy">
                <p className="BodyText">
                    Any changes to this policy will be reflected on this page
                    with an updated date.
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
