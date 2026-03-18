import type { Metadata } from "next";
import LandingPage from "./LandingPage";

export const metadata: Metadata = {
    title: "Pangolog - Minimalist Expense Tracker",
    description:
        "Track your expenses offline, privately, and without an account. A minimalist PWA that keeps your data on your device.",
    openGraph: {
        title: "Pangolog - Minimalist Expense Tracker",
        description:
            "Track your expenses offline, privately, and without an account. A minimalist PWA that keeps your data on your device.",
        url: "/",
    },
};

export default function RootPage() {
    return <LandingPage />;
}
