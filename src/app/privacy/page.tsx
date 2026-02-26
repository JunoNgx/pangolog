import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
    return <PrivacyClient />;
}
