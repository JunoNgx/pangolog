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

function Term({
    name,
    children,
    isHeading = false,
}: {
    name: string;
    children: React.ReactNode;
    isHeading?: boolean;
}) {
    const nameClass = "font-mono text-sm font-medium text-foreground mb-1";
    return (
        <div className="mb-3">
            {isHeading ? (
                <h3 className={nameClass}>{name}</h3>
            ) : (
                <p className={nameClass}>{name}</p>
            )}
            <p className="text-sm text-default-500">{children}</p>
        </div>
    );
}

export default function HelpClient() {
    const router = useRouter();

    return (
        <div className="container mx-auto max-w-2xl px-4 pt-6 pb-24">
            <h1 className="text-xl font-bold mb-2">Manual</h1>
            <p className="text-sm text-default-400 mb-8">
                Pangolog - a minimalist personal expense tracker.
            </p>

            <Section title="System requirements">
                <p className="text-sm text-default-500">
                    Any modern browser (Chrome, Firefox, Safari, Edge) with
                    JavaScript enabled. IndexedDB is required for local storage
                    - all major browsers support it. Google Drive sync requires
                    a Google account and is entirely optional.
                </p>
            </Section>

            <Section title="Installing as an app">
                <p className="text-sm text-default-500 mb-3">
                    Pangolog can be installed as a standalone app on your device
                    for a better experience - no browser chrome, faster access
                    from your home screen.
                </p>
                <Term name="iOS (Safari)" isHeading>
                    Tap the Share button at the bottom of the screen, then
                    select "Add to Home Screen". Safari only - Chrome and
                    Firefox on iOS do not support installation.
                </Term>
                <Term name="Android (Chrome)" isHeading>
                    Tap the three-dot menu in the top right and select "Add to
                    Home Screen" or "Install app". You may also see an install
                    prompt appear automatically.
                </Term>
                <Term name="Desktop (Chrome / Edge)" isHeading>
                    Click the install icon in the address bar, or open the
                    browser menu and select "Install Pangolog".
                </Term>
                <Term name="Other browsers" isHeading>
                    PWA installation support varies by browser and OS. Check
                    your browser's documentation or look for extensions that add
                    PWA support - for example,{" "}
                    <a
                        href="https://addons.mozilla.org/en-US/firefox/addon/pwas-for-firefox/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary-500"
                    >
                        PWAs for Firefox
                    </a>
                    .
                </Term>
            </Section>

            <Section title="Basic concepts">
                <Term name="Small Dimes">
                    Everyday transactions logged by month - groceries, meals,
                    subscriptions. Stored and queried per month.
                </Term>
                <Term name="Big Bucks">
                    Large or irregular transactions logged by year - gadgets,
                    travel, medical. Stored and queried per year.
                </Term>
                <Term name="Categories">
                    Labels attached to transactions. Each category has a name,
                    colour, and emoji icon. Categories can be marked as
                    income-only or Big Bucks-only to filter them from irrelevant
                    pickers.
                </Term>
                <Term name="Recurring rules">
                    Rules that automatically generate transactions on a schedule
                    - daily, weekly, monthly, or yearly. Useful for fixed
                    expenses like rent or subscriptions.
                </Term>
            </Section>

            <Section title="Pages">
                <Term name="Transactions">
                    View and manage Small Dimes or Big Bucks. Switch between
                    modes with the toggle. Filter by month (Dimes) or year
                    (Bucks). Optionally include Big Bucks alongside Dimes for a
                    combined view.
                </Term>
                <Term name="Categories">
                    Create, edit, and reorder categories. Drag to change
                    priority - order is reflected in the category picker when
                    adding transactions.
                </Term>
                <Term name="Summary">
                    Segmented bar charts showing spending by category, for
                    expenses and income separately. Available in monthly and
                    yearly views.
                </Term>
                <Term name="Recurring rules">
                    Set up rules that automatically generate transactions on a
                    daily, weekly, monthly, or yearly schedule.
                </Term>
                <Term name="Settings">
                    Configure display currency, Google Drive sync, and data
                    export/import.
                </Term>
            </Section>

            <Section title="Keyboard shortcuts">
                <h3 className="text-sm font-medium text-default-600 mb-2">
                    Universal
                </h3>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + K
                    </kbd>{" "}
                    opens the command palette for quick navigation and actions.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + .
                    </kbd>{" "}
                    goes to Settings.
                </p>

                <h3 className="text-sm font-medium text-default-600 mb-2 mt-4">
                    Transaction view
                </h3>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Enter
                    </kbd>{" "}
                    opens the create transaction dialog.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + F
                    </kbd>{" "}
                    enters search mode.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Shift + U
                    </kbd>{" "}
                    toggles between Small Dimes and Big Bucks.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Shift + I
                    </kbd>{" "}
                    toggles "Include Big Bucks" when viewing Small Dimes.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + S
                    </kbd>{" "}
                    manually triggers a sync with Google Drive.
                </p>

                <h3 className="text-sm font-medium text-default-600 mb-2 mt-4">
                    Transaction dialog
                </h3>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Enter
                    </kbd>{" "}
                    submits the form from anywhere within the dialog.
                </p>

                <h3 className="text-sm font-medium text-default-600 mb-2 mt-4">
                    Summary view
                </h3>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Shift + Y
                    </kbd>{" "}
                    switches between monthly and yearly view.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Shift + U
                    </kbd>{" "}
                    toggles between Small Dimes and Big Bucks.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Shift + I
                    </kbd>{" "}
                    toggles "Include Big Bucks" when viewing Small Dimes.
                </p>

                <h3 className="text-sm font-medium text-default-600 mb-2 mt-4">
                    Categories view / Recurring view
                </h3>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Enter
                    </kbd>{" "}
                    opens the create dialog.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Shift + U
                    </kbd>{" "}
                    switches between the Categories and Recurring Rules tabs.
                </p>
            </Section>

            <Section title="Recurring rules">
                <p className="text-sm text-default-500 mb-3">
                    Rules are checked and executed on app launch and whenever
                    the app becomes visible again (e.g. switching back from
                    another tab or app).
                </p>
                <p className="text-sm text-default-500">
                    Each rule generates at most one transaction per execution,
                    regardless of how much time has passed. If you have not
                    opened the app in a long time, only the most recent missed
                    occurrence is created - earlier gaps are silently skipped.
                </p>
            </Section>

            <Section title="Debug">
                <p className="text-sm text-default-500 mb-3">
                    A hidden debug section is available in Settings. Tap the
                    "Settings" heading 5 times to toggle its visibility.
                </p>
            </Section>

            <Section title="Google Drive sync">
                <p className="text-sm text-default-500 mb-3">
                    Sync is optional and can be enabled or disabled from
                    Settings. Once connected, sync happens automatically: 30
                    seconds after any change, and when returning to the app
                    after 12+ hours. You can also sync manually via the button
                    in the transaction view.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    Conflicts are resolved by last-write-wins on{" "}
                    <span className="font-mono text-xs">updatedAt</span>.
                    Deleted records are soft-deleted and purged after 60 days.
                </p>
                <h3 className="text-sm font-medium text-default-600 mb-1">
                    Storage structure
                </h3>
                <ul className="text-sm text-default-500 font-mono space-y-1">
                    <li>Pangolog/</li>
                    <li className="pl-4">YYYY.json</li>
                    <li className="pl-4">categories.json</li>
                    <li className="pl-4">recurring-rules.json</li>
                    <li className="pl-4">settings.json</li>
                    <li className="pl-4">backup-YYYY-MM.json</li>
                </ul>
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
