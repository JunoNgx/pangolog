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
import React, { useEffect, useMemo, useState } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { Buck, Dime } from "@/lib/db/types";
import { useCreateBuck, useUpdateBuck } from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCreateDime, useUpdateDime } from "@/lib/hooks/useDimes";

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
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

    const { data: categories } = useCategories();
    const createDime = useCreateDime();
    const updateDime = useUpdateDime();
    const createBuck = useCreateBuck();
    const updateBuck = useUpdateBuck();

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
        setIsCategoryExpanded(false);
    }, [transaction, defaultIsCreatingBuck]);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter((cat) => {
            if (!isCreatingBuck && cat.isBuckOnly) return false;
            if (!isIncome && cat.isIncomeOnly) return false;
            return true;
        });
    }, [categories, isCreatingBuck, isIncome]);

    const visibleCategories = isCategoryExpanded
        ? filteredCategories
        : filteredCategories.slice(0, 7);

    function handleClose() {
        setAmount("");
        setIsIncome(false);
        setIsCreatingBuck(defaultIsCreatingBuck);
        setCategoryId(null);
        setDescription("");
        setIsCategoryExpanded(false);
        onClose();
    }

    function handleAmountChange(value: string) {
        const match = value.match(/^\d*\.?\d{0,2}$/);
        if (match) {
            setAmount(value);
        }
    }

    function handleSubmit(e: React.SyntheticEvent) {
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
                { onSuccess: handleClose },
            );
            return;
        }

        if (isEditing && !isDime(transaction)) {
            updateBuck.mutate(
                { id: transaction.id, input },
                { onSuccess: handleClose },
            );
            return;
        }

        if (isCreatingBuck) {
            createBuck.mutate(input, { onSuccess: handleClose });
            return;
        }

        createDime.mutate(input, { onSuccess: handleClose });
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
                        <div className="flex justify-between items-center gap-4">
                            <ToggleSwitch
                                isSelectingRight={isIncome}
                                onValueChange={setIsIncome}
                                leftLabel="Expense"
                                rightLabel="Income"
                            />

                            {!isEditing && (
                                <ToggleSwitch
                                    isSelectingRight={isCreatingBuck}
                                    onValueChange={setIsCreatingBuck}
                                    leftLabel="Small dime"
                                    rightLabel="Big buck"
                                />
                            )}
                        </div>

                        <Input
                            label="Amount"
                            value={amount}
                            onValueChange={handleAmountChange}
                            isRequired
                            autoFocus
                            inputMode="decimal"
                            placeholder="0.00"
                            onFocus={(e) => e.target.select()}
                            classNames={{
                                input: "text-2xl text-center font-mono",
                            }}
                        />

                        <Input
                            label="Description"
                            value={description}
                            onValueChange={setDescription}
                        />

                        <div>
                            <p className="text-sm text-default-500 mb-2 font-mono">
                                Category
                            </p>
                            <div className={`flex flex-wrap gap-2 ${isCategoryExpanded ? "max-h-[50vh] overflow-y-auto" : ""}`}>
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
                                        onPress={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
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
                            {!isCategoryExpanded && filteredCategories.length > 7 && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    className="mt-2"
                                    onPress={() => setIsCategoryExpanded(true)}
                                >
                                    Show all ({filteredCategories.length})
                                </Button>
                            )}
                            {isCategoryExpanded && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    className="mt-2"
                                    onPress={() => setIsCategoryExpanded(false)}
                                >
                                    Show less
                                </Button>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isPending}
                        >
                            {isEditing ? "Save" : "Create"}
                        </Button>
                        <Button variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
