"use client";

import { Input } from "@heroui/react";

interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
    isIncome: boolean;
    isRequired?: boolean;
}

export function AmountInput({
    value,
    onChange,
    isIncome,
    isRequired = true,
}: AmountInputProps) {
    function handleAmountChange(inputValue: string) {
        const match = inputValue.match(/^\d*\.?\d{0,2}$/);
        if (match) {
            onChange(inputValue);
        }
    }

    const classNames = {
        base: "my-2",
        input: `
            text-4xl text-center font-mono
            ${isIncome ? "!text-success" : "!text-foreground"}
        `,
    };

    return (
        <Input
            variant="underlined"
            value={value}
            onValueChange={handleAmountChange}
            isRequired={isRequired}
            autoFocus
            inputMode="decimal"
            placeholder="0.00"
            onFocus={(e) => e.target.select()}
            classNames={classNames}
        />
    );
}
