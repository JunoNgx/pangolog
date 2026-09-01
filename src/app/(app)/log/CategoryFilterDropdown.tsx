import { Button, Checkbox, Label, Popover } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { BigBuckIndicator } from "@/components/BigBuckIndicator";
import { ChipLabel } from "@/components/ChipLabel";
import { UNCATEGORISED_ID } from "@/lib/constants";
import type { Category } from "@/lib/db/types";

interface CategoryFilterDropdownProps {
    categories: Category[];
    selectedIds: string[] | null;
    onChange: (ids: string[] | null) => void;
    buckCategoryIds: Set<string>;
}

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
            <Checkbox isSelected={isSelected} onChange={onToggle}>
                <Checkbox.Control>
                    <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                    <Label>
                        {icon && <span className="mr-1 text-base">{icon}</span>}{" "}
                        {name}
                        {isBuck && <BigBuckIndicator />}
                        {isIncomeOnly && (
                            <ChipLabel className="text-success">INC</ChipLabel>
                        )}
                    </Label>
                </Checkbox.Content>
            </Checkbox>
        </li>
    );
}

export function CategoryFilterDropdown({
    categories,
    selectedIds,
    onChange,
    buckCategoryIds,
}: CategoryFilterDropdownProps) {
    const allIds = [
        UNCATEGORISED_ID,
        ...categories.map((category) => category.id),
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

    const uncategorisedItem = (
        <li className="py-1">
            <Checkbox
                isSelected={isChecked(UNCATEGORISED_ID)}
                onChange={() => handleToggle(UNCATEGORISED_ID)}
            >
                <Checkbox.Control>
                    <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                    <Label>Uncategorised</Label>
                </Checkbox.Content>
            </Checkbox>
        </li>
    );

    const popoverContent = (
        <div className="flex w-48 flex-col">
            <ul className="flex max-h-64 flex-col overflow-y-auto px-2 py-1">
                {categories.map((category) => (
                    <CategoryFilterItem
                        key={category.id}
                        name={category.name}
                        icon={category.icon}
                        isIncomeOnly={category.isIncomeOnly}
                        isBuck={buckCategoryIds.has(category.id)}
                        isSelected={isChecked(category.id)}
                        onToggle={() => handleToggle(category.id)}
                    />
                ))}
                {uncategorisedItem}
            </ul>
            <div className="flex gap-1 border-t pt-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-sm"
                    onPress={() => onChange(null)}
                >
                    Check all
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-sm"
                    onPress={() => onChange([])}
                >
                    Uncheck all
                </Button>
            </div>
        </div>
    );

    return (
        <Popover>
            <Popover.Trigger>
                <Button variant={isFiltered ? "primary" : "outline"}>
                    {label}
                    <ChevronDown className="size-3" />
                </Button>
            </Popover.Trigger>
            <Popover.Content placement="bottom end">
                <Popover.Dialog>{popoverContent}</Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
