"use client";

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { Buck, Dime } from "@/lib/db/types";
import { useCreateBuck, useUpdateBuck } from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCreateDime, useUpdateDime } from "@/lib/hooks/useDimes";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";

interface TransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Dime | Buck;
    defaultIsCreatingBuck?: boolean;
}

function isDime(tx: Dime | Buck): tx is Dime {
    return "month" in tx;
}

export function TransactionDialog({
    isOpen,
    onClose,
    transaction,
    defaultIsCreatingBuck = false,
}: TransactionDialogProps) {
    const [amount, setAmount] = useState("");
    const [isIncome, setIsIncome] = useState(false);
    const [isCreatingBuck, setIsCreatingBuck] = useState(defaultIsCreatingBuck);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [showAllCategories, setShowAllCategories] = useState(false);

    const { data: categories } = useCategories();
    const createDime = useCreateDime();
    const updateDime = useUpdateDime();
    const createBuck = useCreateBuck();
    const updateBuck = useUpdateBuck();

    const { setHasUsedBefore } = useLocalSettingsStore();

    const isEditing = !!transaction;

    useEffect(() => {
        if (transaction) {
            setAmount((transaction.amount / 100).toFixed(2));
            setIsIncome(transaction.isIncome);
            setIsCreatingBuck(!isDime(transaction));
            setCategoryId(transaction.categoryId);
            setDescription(transaction.description);
        } else {
            setAmount("");
            setIsIncome(false);
            setIsCreatingBuck(defaultIsCreatingBuck);
            setCategoryId(null);
            setDescription("");
        }
        setShowAllCategories(false);
    }, [transaction, defaultIsCreatingBuck]);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter((cat) => {
            if (!isCreatingBuck && cat.isBuckOnly) return false;
            if (!isIncome && cat.isIncomeOnly) return false;
            return true;
        });
    }, [categories, isCreatingBuck, isIncome]);

    const selectedCategory = categoryId
        ? (filteredCategories.find((c) => c.id === categoryId) ?? null)
        : null;

    const visibleCategories = showAllCategories
        ? filteredCategories
        : filteredCategories.slice(0, 7);

    function handleAmountChange(value: string) {
        const match = value.match(/^\d*\.?\d{0,2}$/);
        if (match) {
            setAmount(value);
        }
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        const amountMinor = Math.round(Number.parseFloat(amount) * 100);
        if (Number.isNaN(amountMinor) || amountMinor <= 0) return;

        const input = {
            amount: amountMinor,
            isIncome,
            categoryId,
            description,
        };

        if (isEditing && isDime(transaction)) {
            updateDime.mutate(
                { id: transaction.id, input },
                { onSuccess: onClose },
            );
            return;
        }

        if (isEditing && !isDime(transaction)) {
            updateBuck.mutate(
                { id: transaction.id, input },
                { onSuccess: onClose },
            );
            return;
        }

        setHasUsedBefore(true);

        if (isCreatingBuck) {
            createBuck.mutate(input, { onSuccess: onClose });
            return;
        }

        createDime.mutate(input, { onSuccess: onClose });
    }

    const isPending =
        createDime.isPending ||
        updateDime.isPending ||
        createBuck.isPending ||
        updateBuck.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        {isEditing ? "Edit Transaction" : "New Transaction"}
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <Input
                            label="Amount"
                            value={amount}
                            onValueChange={handleAmountChange}
                            isRequired
                            autoFocus
                            inputMode="decimal"
                            placeholder="0.00"
                        />

                        <Input
                            label="Description"
                            value={description}
                            onValueChange={setDescription}
                        />

                        <div className="flex items-center gap-4">
                            <ToggleSwitch
                                isSelectingRight={isIncome}
                                onValueChange={setIsIncome}
                                leftLabel="Income"
                                leftColor="bg-emerald-600"
                                rightLabel="Expense"
                                rightColor="bg-amber-600"
                            />

                            {!isEditing && (
                                <ToggleSwitch
                                    isSelectingRight={isCreatingBuck}
                                    onValueChange={setIsCreatingBuck}
                                    leftLabel="Big buck"
                                    leftColor="bg-emerald-600"
                                    rightLabel="Small dime"
                                    rightColor="bg-amber-600"
                                />
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-default-500 mb-2 font-mono">
                                Category
                            </p>
                            {selectedCategory && (
                                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border-2 border-primary bg-primary/5">
                                    <span
                                        className="h-4 w-4 rounded-full shrink-0"
                                        style={{
                                            backgroundColor:
                                                selectedCategory.colour,
                                        }}
                                    />
                                    <span className="text-lg">
                                        {selectedCategory.icon || "·"}
                                    </span>
                                    <span className="font-mono font-medium">
                                        {selectedCategory.name}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="ml-auto"
                                        onPress={() => setCategoryId(null)}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {visibleCategories.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        size="sm"
                                        variant={
                                            categoryId === cat.id
                                                ? "solid"
                                                : "flat"
                                        }
                                        color={
                                            categoryId === cat.id
                                                ? "primary"
                                                : "default"
                                        }
                                        onPress={() => setCategoryId(cat.id)}
                                        startContent={
                                            <span
                                                className="h-3 w-3 rounded-full inline-block"
                                                style={{
                                                    backgroundColor: cat.colour,
                                                }}
                                            />
                                        }
                                    >
                                        {cat.icon} {cat.name}
                                    </Button>
                                ))}
                            </div>
                            {!showAllCategories &&
                                filteredCategories.length > 7 && (
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="mt-2"
                                        onPress={() =>
                                            setShowAllCategories(true)
                                        }
                                    >
                                        Show all ({filteredCategories.length})
                                    </Button>
                                )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isPending}
                        >
                            {isEditing ? "Save" : "Create"}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
