import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of service for using Pangolog.",
    openGraph: {
        title: "Pangolog - Terms of Service",
        description: "Terms of service for using Pangolog.",
        url: "/terms",
    },
};

export default function TermsPage() {
    return <TermsClient />;
}
