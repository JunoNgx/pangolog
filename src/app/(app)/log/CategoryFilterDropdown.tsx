import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/Checkbox";
import type { Category } from "@/lib/db/types";

export const UNCATEGORISED_ID = "__uncategorised__";

interface CategoryFilterDropdownProps {
    categories: Category[];
    selectedIds: string[] | null;
    onChange: (ids: string[] | null) => void;
    activeCategoryIds: Set<string>;
    hasUncategorised: boolean;
    buckCategoryIds: Set<string>;
}

export function CategoryFilterDropdown({
    categories,
    selectedIds,
    onChange,
    activeCategoryIds,
    hasUncategorised,
    buckCategoryIds,
}: CategoryFilterDropdownProps) {
    const activeCategories = categories.filter((c) =>
        activeCategoryIds.has(c.id),
    );
    const allIds = [
        ...(hasUncategorised ? [UNCATEGORISED_ID] : []),
        ...activeCategories.map((c) => c.id),
    ];
    const totalCount = allIds.length;
    const selectedCount =
        selectedIds === null ? totalCount : selectedIds.length;
    const isFiltered = selectedIds !== null;

    function isChecked(id: string): boolean {
        if (selectedIds === null) return true;
        return selectedIds.includes(id);
    }

    function handleToggle(id: string) {
        if (selectedIds === null) {
            onChange(allIds.filter((i) => i !== id));
            return;
        }
        const next = selectedIds.includes(id)
            ? selectedIds.filter((i) => i !== id)
            : [...selectedIds, id];
        onChange(next.length === totalCount ? null : next);
    }

    const label = isFiltered
        ? `Filter (${selectedCount}/${totalCount})`
        : "Filter";

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button
                    variant={isFiltered ? "solid" : "flat"}
                    color={isFiltered ? "primary" : "default"}
                    endContent={<ChevronDown className="size-3" />}
                >
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <div className="flex flex-col w-64">
                    <ul className="flex flex-col max-h-64 overflow-y-auto px-2 py-1">
                        {hasUncategorised && (
                            <li className="py-1">
                                <Checkbox
                                    isSelected={isChecked(UNCATEGORISED_ID)}
                                    onValueChange={() =>
                                        handleToggle(UNCATEGORISED_ID)
                                    }
                                    size="md"
                                    classNames={{
                                        base: "max-w-full",
                                        label: "truncate",
                                    }}
                                >
                                    Uncategorised
                                </Checkbox>
                            </li>
                        )}
                        {activeCategories.map((cat) => (
                            <li key={cat.id} className="py-1">
                                <Checkbox
                                    isSelected={isChecked(cat.id)}
                                    onValueChange={() => handleToggle(cat.id)}
                                    size="md"
                                    classNames={{
                                        base: "max-w-full",
                                        label: "truncate",
                                    }}
                                >
                                    <span className="text-base">
                                        {cat.icon}
                                    </span>{" "}
                                    {cat.name}
                                    {buckCategoryIds.has(cat.id) && (
                                        <span className="ml-2 text-xs font-medium text-amber-500">
                                            B
                                        </span>
                                    )}
                                </Checkbox>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-1 p-2 border-t border-default-200">
                        <Button
                            size="sm"
                            variant="light"
                            className="flex-1 text-xs"
                            onPress={() => onChange(null)}
                        >
                            Check all
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            className="flex-1 text-xs"
                            onPress={() => onChange([])}
                        >
                            Uncheck all
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
