"use client";

import { FloatingBackButton } from "@/components/FloatingBackButton";

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
                <p className="text-sm text-default-500">
                    Press{" "}
                    <kbd className="font-mono text-xs bg-default-100 border border-default-200 rounded px-1.5 py-0.5">
                        Ctrl/Cmd + /
                    </kbd>{" "}
                    anywhere in the app to view the full list of keyboard
                    shortcuts.
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
                    after 24+ hours. You can also sync manually via the button
                    in the transaction view.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    Conflicts are resolved by last-write-wins on{" "}
                    <span className="font-mono text-xs">updatedAt</span>.
                    Soft-deleted records are kept for 60 days to ensure correct
                    synchronisation across devices. Sync regularly within this
                    window to prevent stale data.
                </p>
                <p className="text-sm text-default-500 mb-3">
                    Google Drive does not propagate file changes to all servers
                    instantly - this process can take up to an hour. This is an
                    unfortunately known limitation of the Google Drive platform
                    (which is free for both developers and users). If the second
                    device does not pick up changes from the first, wait a while
                    and sync again.
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

            <Section title="Export / import format">
                <p className="text-sm text-default-500 mb-3">
                    The JSON file exported from Settings contains all your data
                    and can be re-imported on any device. You can also
                    hand-craft a file in this format to migrate data from
                    another app. The field references below are formatted to be
                    paste-friendly for an LLM - you can share this section with
                    one to help generate a valid import file.
                </p>
                <p className="text-sm text-default-500 mb-2">
                    Top-level structure:
                </p>
                <pre className="font-mono text-xs bg-default-100 rounded p-3 overflow-x-auto text-default-600 mb-3 leading-relaxed">{`{
  "exportedAt":     "2026-04-10T00:00:00.000Z",
  "categories":     [ ... ],  // required, may be empty
  "transactions":   [ ... ],  // optional
  "recurringRules": [ ... ]   // optional
}`}</pre>
                <p className="text-sm text-default-500 mb-4">
                    Import is additive and non-destructive. Records are merged
                    by <span className="font-mono text-xs">updatedAt</span> -
                    incoming records with a newer timestamp overwrite existing
                    ones; older records are ignored.
                </p>

                <h3 className="text-sm font-medium text-default-600 mb-2">
                    Transaction
                </h3>
                <pre className="font-mono text-xs bg-default-100 rounded p-3 overflow-x-auto text-default-600 mb-4 leading-relaxed">{`// * = required for import
id:           string        // * unique, UUID v4 recommended
transactedAt: string        // * local-offset ISO "2026-04-10T14:30:00+07:00"
updatedAt:    string        // * UTC ISO "2026-04-10T07:30:00.000Z"
deletedAt:    null          //   null for active records
amount:       number        // * integer, minor units (1500 = $15.00)
year:         number        // * integer - must match transactedAt year
month:        number        // * integer 1-12, must match transactedAt month
isBigBuck:    boolean       // * false = Small Dimes, true = Big Bucks
isIncome:     boolean       // * false = expense, true = income
description:  string        //   can be ""
categoryId:   string | null //   references a category id, or null
ruleId?:      string        //   only present on rule-generated transactions
rulePeriod?:  string        //   only present on rule-generated transactions`}</pre>

                <h3 className="text-sm font-medium text-default-600 mb-2">
                    Category
                </h3>
                <pre className="font-mono text-xs bg-default-100 rounded p-3 overflow-x-auto text-default-600 mb-4 leading-relaxed">{`// * = required for import
id:           string        // * unique, UUID v4 recommended
name:         string        // * display name
updatedAt:    string        // * UTC ISO "2026-04-10T07:30:00.000Z"
createdAt:    string        //   UTC ISO
deletedAt:    null          //   null for active records
colour:       string        //   hex color e.g. "#4f6bed"
icon:         string        //   emoji e.g. "🍔"
priority:     number        //   integer; lower = appears earlier in picker
isBuckOnly:   boolean       //   true = hidden from Small Dimes picker
isIncomeOnly: boolean       //   true = hidden from expense picker`}</pre>

                <h3 className="text-sm font-medium text-default-600 mb-2">
                    Recurring rule
                </h3>
                <pre className="font-mono text-xs bg-default-100 rounded p-3 overflow-x-auto text-default-600 mb-4 leading-relaxed">{`// * = required for import
id:               string              // * unique, UUID v4 recommended
updatedAt:        string              // * UTC ISO "2026-04-10T07:30:00.000Z"
amount:           number              // * integer, minor units
frequency:        "daily"             // * one of:
                | "weekly"           //     daily, weekly, monthly, yearly
                | "monthly"
                | "yearly"
isIncome:         boolean             // * false = expense, true = income
isBigBuck:        boolean             // * false = Small Dimes, true = Big Bucks
isActive:         boolean             // * true = rule is running
nextGenerationAt: string              // * local-offset ISO; when the rule next fires
description:      string              //   can be ""
categoryId:       string | null       //   references a category id, or null
createdAt:        string              //   UTC ISO
deletedAt:        null                //   null for active records
lastGeneratedAt:  string | null       //   null if rule has never fired
dayOfWeek:        number(1-7) | null  //   Mon=1 Sun=7; weekly rules only
dayOfMonth:       number(1-31) | null //   monthly/yearly rules; clamped to month end
monthOfYear:      number(1-12) | null //   yearly rules only`}</pre>

                <h3 className="text-sm font-medium text-default-600 mb-2">
                    Timestamp formats
                </h3>
                <ul className="text-sm text-default-500 space-y-1 list-disc list-inside">
                    <li>
                        <span className="font-mono text-xs">transactedAt</span>{" "}
                        and{" "}
                        <span className="font-mono text-xs">
                            nextGenerationAt
                        </span>{" "}
                        - local-offset ISO:{" "}
                        <span className="font-mono text-xs">
                            2026-04-10T14:30:00+07:00
                        </span>
                    </li>
                    <li>
                        Audit fields (
                        <span className="font-mono text-xs">createdAt</span>,{" "}
                        <span className="font-mono text-xs">updatedAt</span>,{" "}
                        <span className="font-mono text-xs">deletedAt</span>,{" "}
                        <span className="font-mono text-xs">
                            lastGeneratedAt
                        </span>
                        ) - UTC ISO:{" "}
                        <span className="font-mono text-xs">
                            2026-04-10T07:30:00.000Z
                        </span>
                    </li>
                    <li>
                        Set <span className="font-mono text-xs">updatedAt</span>{" "}
                        to a recent timestamp - records with an older{" "}
                        <span className="font-mono text-xs">updatedAt</span>{" "}
                        than the existing database entry are ignored on import.
                    </li>
                </ul>
            </Section>

            <FloatingBackButton />
        </div>
    );
}
