"use client";

import { useRouteHeaderContent } from "@/lib/context/RouteHeaderContext";

export function RouteHeader() {
    const { label, centerContent, leftContent, rightContent } =
        useRouteHeaderContent();

    return (
        <div className="flex items-center h-18 p-2">
            <div className="flex flex-1 items-center gap-2">{leftContent}</div>
            {centerContent ?? (
                <h2 className="text-center text-xl font-bold">{label}</h2>
            )}
            <div className="flex flex-1 items-center justify-end gap-2">
                {rightContent}
            </div>
        </div>
    );
}
