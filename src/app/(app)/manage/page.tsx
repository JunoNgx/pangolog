import type { Metadata } from "next";
import { Suspense } from "react";
import ManageClient from "./ManageClient";

export const metadata: Metadata = { title: "Manage" };

export default function ManagePage() {
    return (
        <Suspense>
            <ManageClient />
        </Suspense>
    );
}
