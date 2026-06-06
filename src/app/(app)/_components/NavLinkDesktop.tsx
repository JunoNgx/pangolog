import NextLink from "next/link";
import type { NavItem } from "@/lib/types";

export function NavLinkDesktop({
    item,
    isActive,
}: {
    item: NavItem;
    isActive: boolean;
}) {
    const activeStatusClasses = isActive
        ? "bg-background-tertiary border-b-transparent"
        : "bg-background border-b-foreground text-muted hover:text-foreground";

    return (
        <NextLink
            href={item.href}
            className={`flex items-center gap-2 border-b px-3 py-1.5 text-sm transition-colors ${activeStatusClasses}`}
            aria-current={isActive ? "page" : undefined}
        >
            <item.icon size={15} />
            {item.label}
        </NextLink>
    );
}
