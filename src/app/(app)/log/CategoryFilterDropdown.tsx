import {
    Button,
    Checkbox,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { UNCATEGORISED_ID } from "@/lib/constants";
import type { Category } from "@/lib/db/types";

interface CategoryFilterDropdownProps {
    categories: Category[];
    selectedIds: string[] | null;
    onChange: (ids: string[] | null) => void;
    activeCategoryIds: Set<string>;
    hasUncategorised: boolean;
    buckCategoryIds: Set<string>;
}

const checkboxClassNames = { base: "max-w-full", label: "truncate" };

interface CategoryFilterItemProps {
    name: string;
    icon?: string | null;
    isIncomeOnly?: boolean;
    isBuck?: boolean;
    isSelected: boolean;
    onToggle: () => void;
}

function CategoryFilterItem({
    icon,
    name,
    isIncomeOnly,
    isBuck,
    isSelected,
    onToggle,
}: CategoryFilterItemProps) {
    return (
        <li className="py-1">
            <Checkbox
                isSelected={isSelected}
                onValueChange={onToggle}
                size="md"
                classNames={checkboxClassNames}
            >
                {icon && <span className="text-base">{icon}</span>} {name}
                {isBuck && (
                    <span className="ml-2 text-xs font-medium text-amber-500">
                        BUCK
                    </span>
                )}
                {isIncomeOnly && (
                    <span className="text-success ml-2 text-xs font-medium">
                        INC
                    </span>
                )}
            </Checkbox>
        </li>
    );
}

const popoverClasses = `
    flex flex-col w-64
`;

const listClasses = `
    flex flex-col max-h-64 overflow-y-auto px-2 py-1
`;

const footerClasses = `
    flex gap-1 p-2 border-t border-default-200
`;

const actionButtonClasses = `
    flex-1 text-sm
`;

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
        const nextSelectedIds = selectedIds.includes(id)
            ? selectedIds.filter((i) => i !== id)
            : [...selectedIds, id];
        onChange(
            nextSelectedIds.length === totalCount ? null : nextSelectedIds,
        );
    }

    const label = isFiltered
        ? `Filter (${selectedCount}/${totalCount})`
        : "Filter";

    const uncategorisedItem = hasUncategorised && (
        <li className="py-1">
            <Checkbox
                isSelected={isChecked(UNCATEGORISED_ID)}
                onValueChange={() => handleToggle(UNCATEGORISED_ID)}
                size="md"
                classNames={checkboxClassNames}
            >
                Uncategorised
            </Checkbox>
        </li>
    );

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button
                    variant={isFiltered ? "primary" : "tertiary"}
                >
                    {label}
                    <ChevronDown className="size-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <div className={popoverClasses}>
                    <ul className={listClasses}>
                        {uncategorisedItem}
                        {activeCategories.map((cat) => (
                            <CategoryFilterItem
                                key={cat.id}
                                name={cat.name}
                                icon={cat.icon}
                                isIncomeOnly={cat.isIncomeOnly}
                                isBuck={buckCategoryIds.has(cat.id)}
                                isSelected={isChecked(cat.id)}
                                onToggle={() => handleToggle(cat.id)}
                            />
                        ))}
                    </ul>
                    <div className={footerClasses}>
                        <Button
                            size="sm"
                            variant="tertiary"
                            className={actionButtonClasses}
                            onPress={() => onChange(null)}
                        >
                            Check all
                        </Button>
                        <Button
                            size="sm"
                            variant="tertiary"
                            className={actionButtonClasses}
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
