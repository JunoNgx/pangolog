"use client";

import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HelpClient() {
    const router = useRouter();

    return (
        <div className="container mx-auto max-w-2xl px-4 pt-6 pb-24">
            <h1 className="text-xl font-bold mb-6">Help</h1>

            <p className="text-default-400 text-sm">Content coming soon.</p>

            <Button
                color="default"
                className="fixed bottom-6 right-6 z-50 h-14 min-w-0"
                onPress={() => router.back()}
            >
                <ArrowLeft />
                <span className="hidden md:inline">Go back</span>
            </Button>
        </div>
    );
}
