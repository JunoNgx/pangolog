import type { Metadata } from "next";
import RecurringClient from "./RecurringClient";

export const metadata: Metadata = { title: "Recurring Transactions" };

export default function RecurringPage() {
    return <RecurringClient />;
}
