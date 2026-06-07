"use client";

import { Banknote } from "lucide-react";

export function BigBuckIndicator() {
    return (
        <span className="inline-grid place-items-center px-2 align-middle">
            <Banknote
                className="fill-accent text-accent-foreground"
                size={20}
            />
        </span>
    );
}
