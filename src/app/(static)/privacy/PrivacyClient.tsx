"use client";

import { FloatingBackButton } from "@/components/FloatingBackButton";
import { Section } from "@/components/Section";

export default function PrivacyClient() {
    return (
        <>
            <h1 className="mb-2 text-xl font-bold">Privacy Policy</h1>
            <p className="text-muted mb-8 text-sm">Last updated: March 2026</p>

            <Section title="Overview">
                <p className="text-muted text-sm">
                    Pangolog is an offline-first, privacy-first expense tracker.
                    Your financial data never leaves your device unless you
                    explicitly enable Google Drive sync, in which case it is
                    stored in your own Google Drive account - not on our
                    servers.
                </p>
            </Section>

            <Section title="Your data storage">
                <p className="text-muted mb-3 text-sm">
                    We collect no personal data. All transaction records,
                    categories, and settings are stored locally in your
                    browser&apos;s IndexedDB storage on your device.
                </p>
                <p className="text-muted text-sm">
                    If you connect to Google Drive, we store a session token in
                    an encrypted HTTP-only cookie (valid for 30 days) solely to
                    facilitate token refresh. Your Google email address is
                    stored locally on your device and displayed in Settings. No
                    data is transmitted to or stored on Pangolog servers.
                </p>
            </Section>

            <Section title="Google Drive sync">
                <p className="text-muted mb-3 text-sm">
                    Google Drive sync is entirely optional. When enabled, your
                    data is synced directly to a{" "}
                    <span className="font-mono text-xs">Pangolog/</span> folder
                    in your own Google Drive account. We request only the
                    minimum necessary OAuth scopes to read and write files
                    created by this app.
                </p>
                <p className="text-muted text-sm">
                    You can disconnect Google Drive at any time from Settings.
                    Disconnecting removes our access to your Drive and deletes
                    the session cookie.
                </p>
            </Section>

            <Section title="Third-party services">
                <p className="text-muted text-sm">
                    Pangolog uses Google Identity Services for OAuth
                    authentication and the Google Drive API for optional sync.
                    These interactions are governed by{" "}
                    <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline"
                    >
                        Google&apos;s Privacy Policy
                    </a>
                    . We use no analytics, advertising, or other third-party
                    services.
                </p>
            </Section>

            <Section title="Data deletion">
                <p className="text-muted text-sm">
                    To delete your local data, use the{" "}
                    <span className="font-mono text-xs">Reset all data</span>{" "}
                    option in Settings, or clear your browser&apos;s site data
                    for this app. To remove synced data, delete the{" "}
                    <span className="font-mono text-xs">Pangolog/</span> folder
                    from your Google Drive directly.
                </p>
            </Section>

            <Section title="Changes to this policy">
                <p className="text-muted text-sm">
                    Any changes to this policy will be reflected on this page
                    with an updated date.
                </p>
            </Section>

            <FloatingBackButton />
        </>
    );
}
