import type { Metadata } from "next";
import LogClient from "./LogClient";

export const metadata: Metadata = { title: "Log" };

export default function LogPage() {
    return <LogClient />;
}
