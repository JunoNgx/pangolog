"use client";

import {
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Switch,
} from "@heroui/react";
import { DateTime } from "luxon";
import { type SubmitEventHandler, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AmountInput } from "@/components/AmountInput";
import { CategoryDialog } from "@/components/CategoryDialog";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DialogFooter } from "@/components/DialogFooter";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { RecurringRule } from "@/lib/db/types";
import { useCategories } from "@/lib/hooks/useCategories";
import {
    useCreateRecurringRule,
    useDeleteRecurringRule,
    useRestoreRecurringRule,
    useUpdateRecurringRule,
} from "@/lib/hooks/useRecurringRules";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import {
    fromDateInputValue,
    getLocaleDateFormat,
    MONTH_NAMES,
    SELECT_CLASSES,
    toDateInputValue,
    todayDateString,
} from "@/lib/utils";

type Frequency = "daily" | "weekly" | "monthly" | "yearly";

const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

function getRepeatLabel(frequency: Frequency, dateStr: string): string {
    const dt = DateTime.fromISO(`${dateStr}T12:00:00`);
    switch (frequency) {
        case "daily":
            return "Repeats every day";
        case "weekly":
            return `Repeats every ${DAY_NAMES[dt.weekday % 7]}`;
        case "monthly":
            return `Repeats on the ${dt.day} of each month`;
        case "yearly":
            return `Repeats every ${MONTH_NAMES[dt.month - 1]} ${dt.day}`;
    }
}

import { FORM_MODAL_CLASS_NAMES } from "@/lib/constants";

const statusPanelClasses = `
    p-3 rounded-lg border
    flex items-center justify-between
    bg-default-50 border-default-200
`;

interface RecurringRuleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    rule?: RecurringRule;
}

export function RecurringRuleDialog({
    isOpen,
    onClose,
    rule,
}: RecurringRuleDialogProps) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [isIncome, setIsIncome] = useState(false);
    const [isBigBuck, setIsBigBuck] = useState(true);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [startDate, setStartDate] = useState(todayDateString());
    const [isActive, setIsActive] = useState(true);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    const { data: categories } = useCategories();
    const createRule = useCreateRecurringRule();
    const updateRule = useUpdateRecurringRule();
    const deleteRule = useDeleteRecurringRule();
    const restoreRule = useRestoreRecurringRule();

    const isEditing = !!rule;
    const localeDateFormat = useMemo(() => getLocaleDateFormat(), []);

    useEffect(() => {
        if (rule) {
            setAmount((rule.amount / 100).toFixed(2));
            setDescription(rule.description);
            setIsIncome(rule.isIncome);
            setIsBigBuck(rule.isBigBuck);
            setCategoryId(rule.categoryId);
            setFrequency(rule.frequency);
            setStartDate(toDateInputValue(rule.nextGenerationAt));
            setIsActive(rule.isActive);
        } else {
            setAmount("");
            setDescription("");
            setIsIncome(false);
            setIsBigBuck(true);
            setCategoryId(null);
            setFrequency("monthly");
            setStartDate(todayDateString());
            setIsActive(true);
        }
    }, [rule]);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter((cat) => {
            if (!isBigBuck && cat.isBuckOnly) return false;
            if (!isIncome && cat.isIncomeOnly) return false;
            return true;
        });
    }, [categories, isBigBuck, isIncome]);

    function handleClose() {
        setAmount("");
        setDescription("");
        setIsIncome(false);
        setIsBigBuck(true);
        setCategoryId(null);
        setFrequency("monthly");
        setStartDate(todayDateString());
        setIsActive(true);
        onClose();
    }

    function handleFrequencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setFrequency(e.target.value as Frequency);
    }

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const amountMinor = Math.round(Number.parseFloat(amount) * 100);
        if (Number.isNaN(amountMinor) || amountMinor <= 0) return;

        const dt = DateTime.fromISO(`${startDate}T12:00:00`);
        const input = {
            amount: amountMinor,
            description,
            isIncome,
            isBigBuck,
            categoryId,
            frequency,
            dayOfWeek: dt.weekday % 7,
            dayOfMonth: dt.day,
            monthOfYear: dt.month,
            nextGenerationAt: fromDateInputValue(startDate),
            isActive,
        };

        if (isEditing) {
            updateRule.mutate(
                { id: rule.id, input },
                { onSuccess: handleClose },
            );
            return;
        }

        createRule.mutate(input, { onSuccess: handleClose });
    };

    function handleDelete() {
        if (!rule) return;
        const id = rule.id;
        deleteRule.mutate(id, {
            onSuccess: () => {
                handleClose();
                toast("Rule deleted", {
                    duration: 5000,
                    action: {
                        label: "Undo",
                        onClick: () => restoreRule.mutate(id),
                    },
                });
            },
        });
    }

    const { isExpenseOnlyMode } = useProfileSettingsStore();
    const isPending = createRule.isPending || updateRule.isPending;
    const isDeleting = deleteRule.isPending;
    const repeatLabel = getRepeatLabel(frequency, startDate);

    const isTxTypeSwitchVisible = !isExpenseOnlyMode;
    const isExpenseTypeSwitchVisible = true;
    const isSingleToggle =
        (isTxTypeSwitchVisible && !isExpenseTypeSwitchVisible) ||
        (!isTxTypeSwitchVisible && isExpenseTypeSwitchVisible);

    const toggleRowClasses = `
        flex gap-4 mt-2
        ${isSingleToggle ? "justify-center" : isEditing ? "justify-around" : "justify-between"}
    `;

    const ruleStatusPanel = isEditing && rule && (
        <div className={statusPanelClasses}>
            <div className="flex flex-col gap-1">
                <Switch
                    isSelected={isActive}
                    onValueChange={setIsActive}
                    color="success"
                >
                    <span className="text-sm font-medium">
                        {isActive ? "Active" : "Paused"}
                    </span>
                </Switch>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs font-mono text-default-400">
                <span>
                    Next:{" "}
                    {DateTime.fromISO(rule.nextGenerationAt).toLocaleString(
                        DateTime.DATE_MED,
                    )}
                </span>
                <span>
                    Last:{" "}
                    {rule.lastGeneratedAt
                        ? DateTime.fromISO(rule.lastGeneratedAt).toLocaleString(
                              DateTime.DATE_MED,
                          )
                        : "Never"}
                </span>
            </div>
        </div>
    );

    const typeToggleRow = (
        <div className={toggleRowClasses}>
            {isTxTypeSwitchVisible && (
                <ToggleSwitch
                    isSelectingRight={isIncome}
                    onValueChange={setIsIncome}
                    leftLabel="Expense"
                    rightLabel="Income"
                />
            )}
            {isExpenseTypeSwitchVisible && (
                <ToggleSwitch
                    isSelectingRight={isBigBuck}
                    onValueChange={setIsBigBuck}
                    leftLabel="Small dime"
                    rightLabel="Big buck"
                />
            )}
        </div>
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                classNames={FORM_MODAL_CLASS_NAMES}
            >
                <ModalContent>
                    <form onSubmit={handleSubmit}>
                        <ModalHeader>
                            {isEditing
                                ? "Edit Recurring Rule"
                                : "New Recurring Rule"}
                        </ModalHeader>
                        <ModalBody className="gap-4">
                            {ruleStatusPanel}
                            {typeToggleRow}

                            <AmountInput
                                value={amount}
                                onChange={setAmount}
                                isIncome={isIncome}
                            />

                            <Input
                                classNames={{ input: "font-mono" }}
                                label="Description"
                                value={description}
                                onValueChange={setDescription}
                                maxLength={60}
                                description={`${description.length}/60`}
                            />

                            <div className="flex gap-3 items-end justify-between">
                                <Input
                                    type="date"
                                    label={
                                        <span>
                                            Start date{" "}
                                            <span className="font-mono text-default-400 text-xs">
                                                {localeDateFormat}
                                            </span>
                                        </span>
                                    }
                                    value={startDate}
                                    onValueChange={setStartDate}
                                    isRequired
                                    className="w-1/2"
                                />
                                <div className="flex flex-col gap-1 shrink-0">
                                    <span className="text-sm text-default-500">
                                        Frequency
                                    </span>
                                    <select
                                        value={frequency}
                                        onChange={handleFrequencyChange}
                                        className={SELECT_CLASSES}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <p className="text-xs font-mono -mt-2">
                                {repeatLabel}
                            </p>

                            <CategoryPicker
                                categories={filteredCategories}
                                selectedId={categoryId}
                                onChange={setCategoryId}
                                onAdd={() => setIsCategoryDialogOpen(true)}
                            />
                        </ModalBody>
                        <DialogFooter
                            isEditing={isEditing}
                            onCancel={handleClose}
                            onDelete={isEditing ? handleDelete : undefined}
                            isSubmitting={isPending}
                            isDeleting={isDeleting}
                        />
                    </form>
                </ModalContent>
            </Modal>
            <CategoryDialog
                isOpen={isCategoryDialogOpen}
                onClose={() => setIsCategoryDialogOpen(false)}
                onCreated={setCategoryId}
            />
        </>
    );
}
