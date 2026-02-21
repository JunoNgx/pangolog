import type { RadioProps } from "@heroui/react";
import { Radio as HeroRadio } from "@heroui/react";

export function Radio({ classNames, ...props }: RadioProps) {
    return (
        <HeroRadio
            classNames={{
                ...classNames,
                wrapper: `rounded-none ${classNames?.wrapper ?? ""}`,
                control: `rounded-none ${classNames?.control ?? ""}`,
            }}
            {...props}
        />
    );
}
