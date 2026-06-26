export interface CategoryMeta {
    emoji: string;
    colour: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
    Entertainment: { emoji: "🎬", colour: "#EC4899" },
    Food: { emoji: "🥪", colour: "#F97316" },
    Groceries: { emoji: "🛒", colour: "#84CC16" },
    Lifestyle: { emoji: "👕", colour: "#A855F7" },
    Gifts: { emoji: "🎁", colour: "#EF4444" },
    Transport: { emoji: "🚌", colour: "#3B82F6" },
    Utilities: { emoji: "💡", colour: "#FBBF24" },
    Rent: { emoji: "🏠", colour: "#8B5CF6" },
    Healthcare: { emoji: "💊", colour: "#F43F5E" },
    Others: { emoji: "📦", colour: "#6B7280" },
    Subscriptions: { emoji: "📺", colour: "#F59E0B" },
    Family: { emoji: "👨\u200D👩\u200D👧", colour: "#F472B6" },
    Fashion: { emoji: "👗", colour: "#DB2777" },
    Allowance: { emoji: "💵", colour: "#22C55E" },
};

const FALLBACK_PALETTE: string[] = [
    "#14B8A6",
    "#0EA5E9",
    "#6366F1",
    "#D946EF",
    "#F43F5E",
    "#FB923C",
    "#65A30D",
    "#0D9488",
    "#7C3AED",
    "#DB2777",
    "#0284C7",
    "#CA8A04",
];

const FALLBACK_ICON = "📦";

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function fnv1a(input: string): number {
    let hash = FNV_OFFSET_BASIS;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, FNV_PRIME);
    }
    return hash >>> 0;
}

export function getCategoryMeta(name: string): CategoryMeta {
    const matchedMeta = CATEGORY_META[name];
    if (matchedMeta) return matchedMeta;
    const hash = fnv1a(name.trim().toLowerCase());
    return {
        emoji: FALLBACK_ICON,
        colour: FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length],
    };
}
