import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Pangolog's privacy policy. Your data is stored locally on your device and never sent to any server.",
    openGraph: {
        title: "Pangolog - Privacy Policy",
        description:
            "Pangolog's privacy policy. Your data is stored locally on your device and never sent to any server.",
        url: "/privacy",
    },
};

export default function PrivacyPage() {
    return <PrivacyClient />;
}
