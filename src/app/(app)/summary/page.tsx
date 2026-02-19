import type { Metadata } from "next";
import SummaryClient from "./SummaryClient";

export const metadata: Metadata = { title: "Summary" };

export default function SummaryPage() {
    return <SummaryClient />;
}
