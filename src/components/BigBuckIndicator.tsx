"use client";

import { Banknote } from "lucide-react";

export function BigBuckIndicator() {
    return (
        <span className="grid place-items-center p-2">
            <Banknote
                className="fill-accent text-accent-foreground"
                size={20}
            />
        </span>
    );
}
