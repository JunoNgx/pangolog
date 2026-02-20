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
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { Buck, Dime } from "@/lib/db/types";
import {
    useCreateBuck,
    useDeleteBuck,
    useRestoreBuck,
    useUpdateBuck,
} from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import {
    useCreateDime,
    useDeleteDime,
    useRestoreDime,
    useUpdateDime,
} from "@/lib/hooks/useDimes";

interface TransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Dime | Buck;
    defaultIsCreatingBuck?: boolean;
}

function isDime(tx: Dime | Buck): tx is Dime {
    return "month" in tx;
}

function todayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function toDateInputValue(isoString: string): string {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function fromDateInputValue(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toISOString();
}

export function TransactionDialog({
    isOpen,
    onClose,
    transaction,
    defaultIsCreatingBuck = false,
}: TransactionDialogProps) {
    const [amount, setAmount] = useState("");
    const [transactedAt, setTransactedAt] = useState(todayDateString());
    const [isIncome, setIsIncome] = useState(false);
    const [isCreatingBuck, setIsCreatingBuck] = useState(defaultIsCreatingBuck);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [description, setDescription] = useState("");

    const { data: categories } = useCategories();
    const createDime = useCreateDime();
    const updateDime = useUpdateDime();
    const deleteDime = useDeleteDime();
    const restoreDime = useRestoreDime();
    const createBuck = useCreateBuck();
    const updateBuck = useUpdateBuck();
    const deleteBuck = useDeleteBuck();
    const restoreBuck = useRestoreBuck();

    const isEditing = !!transaction;

    useEffect(() => {
        if (transaction) {
            setAmount((transaction.amount / 100).toFixed(2));
            setTransactedAt(toDateInputValue(transaction.transactedAt));
            setIsIncome(transaction.isIncome);
            setIsCreatingBuck(!isDime(transaction));
            setCategoryId(transaction.categoryId);
            setDescription(transaction.description);
        } else {
            setAmount("");
            setTransactedAt(todayDateString());
            setIsIncome(false);
            setIsCreatingBuck(defaultIsCreatingBuck);
            setCategoryId(null);
            setDescription("");
        }
    }, [transaction, defaultIsCreatingBuck]);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter((cat) => {
            if (!isCreatingBuck && cat.isBuckOnly) return false;
            if (!isIncome && cat.isIncomeOnly) return false;
            return true;
        });
    }, [categories, isCreatingBuck, isIncome]);

    // On Android (Chrome and Firefox), tapping the backdrop to close the dialog
    // causes the keyboard to flash briefly. This happens because the input blur
    // fires mid-animation, after the close has already begun. Blurring on
    // touchstart (before the click/onClose fires) gives the keyboard a full
    // touch cycle to dismiss before the modal starts closing.
    function handleBackdropTouchStart(e: React.TouchEvent) {
        if (!(e.target as HTMLElement).closest('[role="dialog"]')) {
            (document.activeElement as HTMLElement)?.blur();
        }
    }

    function handleClose() {
        setAmount("");
        setTransactedAt(todayDateString());
        setIsIncome(false);
        setIsCreatingBuck(defaultIsCreatingBuck);
        setCategoryId(null);
        setDescription("");
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
            transactedAt: fromDateInputValue(transactedAt),
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

    function handleDelete() {
        if (!transaction) return;
        const id = transaction.id;
        if (isDime(transaction)) {
            deleteDime.mutate(id, {
                onSuccess: () => {
                    handleClose();
                    toast("Transaction deleted", {
                        duration: 5000,
                        action: {
                            label: "Undo",
                            onClick: () => restoreDime.mutate(id),
                        },
                    });
                },
            });
        } else {
            deleteBuck.mutate(id, {
                onSuccess: () => {
                    handleClose();
                    toast("Transaction deleted", {
                        duration: 5000,
                        action: {
                            label: "Undo",
                            onClick: () => restoreBuck.mutate(id),
                        },
                    });
                },
            });
        }
    }

    const isPending =
        createDime.isPending ||
        updateDime.isPending ||
        createBuck.isPending ||
        updateBuck.isPending;

    const isDeleting = deleteDime.isPending || deleteBuck.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            onTouchStart={handleBackdropTouchStart}
            classNames={{ closeButton: "cursor-pointer" }}
        >
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        {isEditing ? "Edit Transaction" : "New Transaction"}
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <div className="flex justify-center items-center gap-4">
                            {!isEditing && (
                                <ToggleSwitch
                                    isSelectingRight={isCreatingBuck}
                                    onValueChange={setIsCreatingBuck}
                                    leftLabel="Small dime"
                                    rightLabel="Big buck"
                                />
                            )}
                        </div>

                        <div
                            className={`
                            flex justify-around gap-8
                            ${isEditing ? "" : "mt-5"}
                        `}
                        >
                            <Input
                                type="date"
                                label="Date"
                                value={transactedAt}
                                onValueChange={setTransactedAt}
                                isRequired
                            />
                            <ToggleSwitch
                                isSelectingRight={isIncome}
                                onValueChange={setIsIncome}
                                leftLabel="Expense"
                                rightLabel="Income"
                            />
                        </div>

                        <Input
                            variant="underlined"
                            value={amount}
                            onValueChange={handleAmountChange}
                            isRequired
                            autoFocus
                            inputMode="decimal"
                            placeholder="0.00"
                            onFocus={(e) => e.target.select()}
                            classNames={{
                                base: "my-2",
                                input: `
                                    text-4xl text-center font-mono
                                    ${isIncome ? "text-success" : "text-foreground"}
                                `,
                            }}
                        />

                        <Input
                            label="Description"
                            value={description}
                            onValueChange={setDescription}
                            maxLength={60}
                            description={`${description.length}/60`}
                        />

                        <div>
                            <p className="text-sm text-default-500 mb-2 font-mono">
                                Category
                            </p>
                            {filteredCategories.length === 0 && (
                                <p className="text-sm text-default-400 font-mono">
                                    No categories available. Add one from the
                                    Categories menu.
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                                {filteredCategories.map((cat) => (
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
                                        onPress={() =>
                                            setCategoryId(
                                                categoryId === cat.id
                                                    ? null
                                                    : cat.id,
                                            )
                                        }
                                        endContent={
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
                        </div>
                    </ModalBody>
                    <ModalFooter
                        className={isEditing ? "justify-between" : undefined}
                    >
                        {isEditing && (
                            <Button
                                color="danger"
                                variant="light"
                                isLoading={isDeleting}
                                onPress={handleDelete}
                            >
                                Delete
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isPending}
                            >
                                {isEditing ? "Save" : "Create"}
                            </Button>
                            <Button variant="light" onPress={handleClose}>
                                Cancel
                            </Button>
                        </div>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
