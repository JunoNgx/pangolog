import NextLink from "next/link";
import type { NavItem } from "@/lib/types";

export function NavLinkMobile({
    item,
    isActive,
}: {
    item: NavItem;
    isActive: boolean;
}) {
    const activeStatusClasses = isActive
        ? "bg-background border-t-transparent"
        : "bg-background-tertiary border-t-foreground text-muted hover:text-foreground";

    return (
        <NextLink
            href={item.href}
            // z-index so focus ring isn't overlapped by adjacent navlink
            className={`relative flex flex-auto items-center justify-center gap-1 border-t py-3 text-sm transition-colors focus-visible:z-10 ${activeStatusClasses}`}
            aria-current={isActive ? "page" : undefined}
        >
            <item.icon size={14} />
            {item.label}
        </NextLink>
    );
}
