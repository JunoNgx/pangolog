import type { Metadata } from "next";
import HelpClient from "./HelpClient";

export const metadata: Metadata = {
    title: "Help",
    description:
        "Learn how to use Pangolog - keyboard shortcuts, sync, recurring rules, and more.",
    openGraph: {
        title: "Pangolog - Help",
        description:
            "Learn how to use Pangolog - keyboard shortcuts, sync, recurring rules, and more.",
        url: "/help",
    },
};

export default function HelpPage() {
    return <HelpClient />;
}
