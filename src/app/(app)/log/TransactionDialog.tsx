"use client";

import { Input, Modal } from "@heroui/react";
import { DateTime } from "luxon";
import type React from "react";
import {
    type SubmitEventHandler,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AmountInput } from "@/components/AmountInput";
import { CategoryDialog } from "@/components/CategoryDialog";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DialogFooter } from "@/components/DialogFooter";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { Transaction } from "@/lib/db/types";
import { useCategories } from "@/lib/hooks/useCategories";
import {
    useCreateTransaction,
    useDeleteTransaction,
    useRestoreTransaction,
    useUpdateTransaction,
} from "@/lib/hooks/useTransactions";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import {
    fromDateInputValue,
    getLocaleDateFormat,
    showDeleteToast,
    toDateInputValue,
    todayDateString,
    toIsoString,
} from "@/lib/utils";

interface TransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction;
    defaultIsBigBuck?: boolean;
}

export function TransactionDialog({
    isOpen,
    onClose,
    transaction,
    defaultIsBigBuck = false,
}: TransactionDialogProps) {
    const [amount, setAmount] = useState("");
    const [transactedAt, setTransactedAt] = useState(todayDateString());
    const [isIncome, setIsIncome] = useState(false);
    const [isBigBuck, setIsBigBuck] = useState(defaultIsBigBuck);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    const { data: categories } = useCategories();
    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const deleteTransaction = useDeleteTransaction();
    const restoreTransaction = useRestoreTransaction();

    const { isExpenseOnlyMode } = useProfileSettingsStore();
    const isEditing = !!transaction;
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (transaction) {
            setAmount((transaction.amount / 100).toFixed(2));
            setTransactedAt(toDateInputValue(transaction.transactedAt));
            setIsIncome(transaction.isIncome);
            setIsBigBuck(transaction.isBigBuck);
            setCategoryId(transaction.categoryId);
            setDescription(transaction.description);
        } else {
            setAmount("");
            setTransactedAt(todayDateString());
            setIsIncome(false);
            setIsBigBuck(defaultIsBigBuck);
            setCategoryId(null);
            setDescription("");
        }
    }, [transaction, defaultIsBigBuck]);

    const localeDateFormat = useMemo(() => getLocaleDateFormat(), []);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter((cat) => {
            if (!isBigBuck && cat.isBuckOnly) return false;
            if (!isIncome && cat.isIncomeOnly) return false;
            return true;
        });
    }, [categories, isBigBuck, isIncome]);

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
        setIsBigBuck(defaultIsBigBuck);
        setCategoryId(null);
        setDescription("");
        onClose();
    }

    function resolveTransactedAt(): string {
        if (isEditing && transaction) {
            if (transactedAt === toDateInputValue(transaction.transactedAt))
                return transaction.transactedAt;
            return fromDateInputValue(transactedAt);
        }
        if (transactedAt === todayDateString())
            return toIsoString(DateTime.now());
        return fromDateInputValue(transactedAt);
    }

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const amountMinor = Math.round(Number.parseFloat(amount) * 100);
        if (Number.isNaN(amountMinor) || amountMinor <= 0) return;

        const input = {
            transactedAt: resolveTransactedAt(),
            amount: amountMinor,
            isIncome,
            isBigBuck: isBigBuck,
            categoryId,
            description: description?.trim(),
        };

        if (isEditing) {
            updateTransaction.mutate(
                { id: transaction.id, input },
                { onSuccess: handleClose },
            );
            return;
        }

        createTransaction.mutate(input, { onSuccess: handleClose });
    };

    // Ctrl/Cmd+Enter submits the form from anywhere in the dialog, including
    // when a category button is focused. HeroUI buttons call stopPropagation on
    // keydown, so a regular bubbling listener on the form never fires. Using
    // capture mode intercepts the event before it reaches the button.
    useEffect(() => {
        if (!isOpen) return;
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                formRef.current?.requestSubmit();
            }
        }
        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () =>
            window.removeEventListener("keydown", handleKeyDown, {
                capture: true,
            });
    }, [isOpen]);

    function handleDelete() {
        if (!transaction) return;
        const id = transaction.id;
        deleteTransaction.mutate(id, {
            onSuccess: () => {
                handleClose();
                showDeleteToast("Transaction", () =>
                    restoreTransaction.mutate(id),
                );
            },
        });
    }

    const isPending =
        createTransaction.isPending || updateTransaction.isPending;
    const isDeleting = deleteTransaction.isPending;

    return (
        <>
            <Modal>
                <Modal.Backdrop
                    isOpen={isOpen}
                    onOpenChange={(open) => {
                        if (!open) handleClose();
                    }}
                    onTouchStart={handleBackdropTouchStart}
                >
                    <Modal.Container>
                        <Modal.Dialog>
                            {({ close }) => (
                                <>
                                    <Modal.CloseTrigger className="cursor-pointer" />
                                    <form ref={formRef} onSubmit={handleSubmit}>
                                        <Modal.Header>
                                            <Modal.Heading>
                                                {isEditing
                                                    ? "Edit Transaction"
                                                    : "New Transaction"}
                                            </Modal.Heading>
                                        </Modal.Header>
                                        <Modal.Body className="gap-4 overflow-y-auto max-h-[calc(var(--visual-viewport-height,100svh)-10rem)]">
                                            {!isEditing &&
                                                !isExpenseOnlyMode && (
                                                    <div className="mb-4 flex items-center justify-center gap-4">
                                                        <ToggleSwitch
                                                            label="Transaction flow type"
                                                            isSelectingRight={
                                                                isIncome
                                                            }
                                                            onValueChange={
                                                                setIsIncome
                                                            }
                                                            leftLabel="Expense"
                                                            rightLabel="Income"
                                                        />
                                                    </div>
                                                )}

                                            <div className="flex items-end gap-4">
                                                <div className="flex flex-1 flex-col gap-1">
                                                    <span>
                                                        Date{" "}
                                                        <span className="text-muted font-mono text-xs">
                                                            {localeDateFormat}
                                                        </span>
                                                    </span>
                                                    <Input
                                                        type="date"
                                                        value={transactedAt}
                                                        onChange={(e) =>
                                                            setTransactedAt(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </div>
                                                <ToggleSwitch
                                                    className="flex-1"
                                                    label="Transaction type"
                                                    isSelectingRight={isBigBuck}
                                                    onValueChange={setIsBigBuck}
                                                    leftLabel="Small dime"
                                                    rightLabel="Big buck"
                                                />
                                            </div>

                                            <AmountInput
                                                value={amount}
                                                onChange={setAmount}
                                                isIncome={isIncome}
                                            />

                                            <div className="flex flex-col gap-1">
                                                <span>Description</span>
                                                <Input
                                                    className="font-mono"
                                                    value={description}
                                                    onChange={(e) =>
                                                        setDescription(
                                                            e.target.value,
                                                        )
                                                    }
                                                    maxLength={60}
                                                />
                                                <span className="text-muted text-xs">
                                                    {description.length}/60
                                                </span>
                                            </div>

                                            <CategoryPicker
                                                categories={filteredCategories}
                                                selectedId={categoryId}
                                                onChange={setCategoryId}
                                                onAdd={() =>
                                                    setIsCategoryDialogOpen(
                                                        true,
                                                    )
                                                }
                                            />
                                        </Modal.Body>
                                        <DialogFooter
                                            isEditing={isEditing}
                                            onCancel={handleClose}
                                            onDelete={
                                                isEditing
                                                    ? handleDelete
                                                    : undefined
                                            }
                                            isSubmitting={isPending}
                                            isDeleting={isDeleting}
                                            showSubmitTooltip
                                        />
                                    </form>
                                </>
                            )}
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
            <CategoryDialog
                isOpen={isCategoryDialogOpen}
                onClose={() => setIsCategoryDialogOpen(false)}
                onCreated={setCategoryId}
            />
        </>
    );
}
