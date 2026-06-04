"use client";

import { Input } from "@heroui/react";

interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
    isIncome: boolean;
    isRequired?: boolean;
    ref?: React.Ref<HTMLInputElement>;
}

export function AmountInput({
    value,
    onChange,
    isIncome,
    isRequired = true,
    ref,
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
                fullWidth
                ref={ref}
                value={value}
                onChange={(e) => handleAmountChange(e.target.value)}
                required={isRequired}
                inputMode="decimal"
                placeholder="0.00"
                onFocus={(e) => e.target.select()}
                className={`focus:border-foreground rounded-none border-0 border-b-2 border-transparent text-center font-mono text-4xl ${isIncome ? "text-success" : "text-foreground"} `}
            />
        </div>
    );
}
