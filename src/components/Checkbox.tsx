import type { CheckboxProps } from "@heroui/react";
import { Checkbox as HeroCheckbox } from "@heroui/react";

export function Checkbox({ classNames, ...props }: CheckboxProps) {
    return (
        <HeroCheckbox
            classNames={{
                ...classNames,
                wrapper: `rounded-none ${classNames?.wrapper ?? ""}`,
            }}
            {...props}
        />
    );
}
