import {
    Button,
    Checkbox,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/lib/db/types";

export const UNCATEGORISED_ID = "__uncategorised__";

interface CategoryFilterDropdownProps {
    categories: Category[];
    selectedIds: string[] | null;
    onChange: (ids: string[] | null) => void;
}

export function CategoryFilterDropdown({
    categories,
    selectedIds,
    onChange,
}: CategoryFilterDropdownProps) {
    const allIds = [UNCATEGORISED_ID, ...categories.map((c) => c.id)];
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
                        <li className="py-1">
                            <Checkbox
                                isSelected={isChecked(UNCATEGORISED_ID)}
                                onValueChange={() =>
                                    handleToggle(UNCATEGORISED_ID)
                                }
                                size="md"
                                classNames={{
                                    base: "max-w-full",
                                    label: "font-mono text-sm text-default-500 truncate",
                                }}
                            >
                                Uncategorised
                            </Checkbox>
                        </li>
                        {categories.map((cat) => (
                            <li key={cat.id} className="py-1">
                                <Checkbox
                                    isSelected={isChecked(cat.id)}
                                    onValueChange={() => handleToggle(cat.id)}
                                    size="md"
                                    classNames={{
                                        base: "max-w-full",
                                        label: "font-mono text-sm truncate",
                                    }}
                                >
                                    <span className="text-base">
                                        {cat.icon}
                                    </span>{" "}
                                    {cat.name}
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
