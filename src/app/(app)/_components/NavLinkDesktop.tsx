import NextLink from "next/link";
import type { NavItem } from "@/lib/types";

export function NavLinkDesktop({
    item,
    isActive,
}: {
    item: NavItem;
    isActive: boolean;
}) {
    return (
        <NextLink
            href={item.href}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
        >
            <item.icon size={15} />
            {item.label}
        </NextLink>
    );
}
