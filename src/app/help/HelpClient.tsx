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
}: {
    name: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-3">
            <p className="font-mono text-sm font-medium text-foreground mb-1">
                {name}
            </p>
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
                    income-only or Big Bucks-only to filter them from
                    irrelevant pickers.
                </Term>
            </Section>

            <Section title="Pages">
                <Term name="Transactions">
                    View and manage Small Dimes or Big Bucks. Switch between
                    modes with the toggle. Filter by month (Dimes) or year
                    (Bucks). Optionally include Big Bucks alongside Dimes for
                    a combined view.
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
                <p className="text-sm text-default-500">
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + Enter
                    </kbd>
                    {" "}opens the create dialog on the Transactions, Categories,
                    and Recurring rules pages.
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

            <Section title="Google Drive sync">
                <p className="text-sm text-default-500 mb-3">
                    Sync is optional and can be enabled or disabled from
                    Settings. When connected, data is synced automatically
                    after changes and whenever the app becomes visible again.
                    Syncing is debounced - the app waits 30 seconds after the
                    last change before uploading, rather than sending a
                    request on every edit. This reduces unnecessary API calls
                    and avoids hitting Google Drive&apos;s rate limits.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    Conflicts are resolved by last-write-wins using the
                    record&apos;s{" "}
                    <span className="font-mono text-xs">updatedAt</span>{" "}
                    timestamp.
                </p>
                <p className="text-sm font-medium text-default-600 mb-1">
                    Storage structure
                </p>
                <ul className="text-sm text-default-500 font-mono space-y-1">
                    <li>Pangolog/</li>
                    <li className="pl-4">YYYY-MM.json</li>
                    <li className="pl-4">YYYY-bucks.json</li>
                    <li className="pl-4">categories.json</li>
                    <li className="pl-4">recurring-rules.json</li>
                    <li className="pl-4">settings.json</li>
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
