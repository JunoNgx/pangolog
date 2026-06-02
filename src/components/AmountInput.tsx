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

    return (
        <div className="my-2">
            <Input
                value={value}
                onChange={(e) => handleAmountChange(e.target.value)}
                required={isRequired}
                autoFocus
                inputMode="decimal"
                placeholder="0.00"
                onFocus={(e) => e.target.select()}
                className={`
                    text-4xl text-center font-mono border-b-2 border-default-200 rounded-none
                    ${isIncome ? "!text-success" : "!text-foreground"}
                `}
            />
        </div>
    );
}
