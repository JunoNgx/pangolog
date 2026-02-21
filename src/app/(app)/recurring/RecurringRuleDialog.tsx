"use client";

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Switch,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { RecurringRule } from "@/lib/db/types";
import { useCategories } from "@/lib/hooks/useCategories";
import {
    useCreateRecurringRule,
    useDeleteRecurringRule,
    useRestoreRecurringRule,
    useUpdateRecurringRule,
} from "@/lib/hooks/useRecurringRules";

type Frequency = "daily" | "weekly" | "monthly" | "yearly";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function todayDateString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function toDateInputValue(isoString: string): string {
    const d = new Date(isoString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function fromDateInputValue(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toISOString();
}

function getRepeatLabel(frequency: Frequency, dateStr: string): string {
    const date = new Date(`${dateStr}T12:00:00`);
    switch (frequency) {
        case "daily":
            return "Repeats every day";
        case "weekly":
            return `Repeats every ${DAY_NAMES[date.getDay()]}`;
        case "monthly":
            return `Repeats on the ${date.getDate()} of each month`;
        case "yearly":
            return `Repeats every ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
    }
}

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
    const [isBigBuck, setIsBigBuck] = useState(false);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [startDate, setStartDate] = useState(todayDateString());
    const [isActive, setIsActive] = useState(true);

    const { data: categories } = useCategories();
    const createRule = useCreateRecurringRule();
    const updateRule = useUpdateRecurringRule();
    const deleteRule = useDeleteRecurringRule();
    const restoreRule = useRestoreRecurringRule();

    const isEditing = !!rule;

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
            setIsBigBuck(false);
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

    function handleAmountChange(value: string) {
        const match = value.match(/^\d*\.?\d{0,2}$/);
        if (match) setAmount(value);
    }

    function handleClose() {
        setAmount("");
        setDescription("");
        setIsIncome(false);
        setIsBigBuck(false);
        setCategoryId(null);
        setFrequency("monthly");
        setStartDate(todayDateString());
        setIsActive(true);
        onClose();
    }

    function handleFrequencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setFrequency(e.target.value as Frequency);
    }

    function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        const amountMinor = Math.round(Number.parseFloat(amount) * 100);
        if (Number.isNaN(amountMinor) || amountMinor <= 0) return;

        const date = new Date(`${startDate}T12:00:00`);
        const input = {
            amount: amountMinor,
            description,
            isIncome,
            isBigBuck,
            categoryId,
            frequency,
            dayOfWeek: date.getDay(),
            dayOfMonth: date.getDate(),
            monthOfYear: date.getMonth() + 1,
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
    }

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

    const isPending = createRule.isPending || updateRule.isPending;
    const isDeleting = deleteRule.isPending;
    const repeatLabel = getRepeatLabel(frequency, startDate);

    const selectClasses = `
        rounded-lg px-3 py-2
        text-sm text-foreground
        bg-default-100 border border-default-200
        cursor-pointer
    `;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNames={{ closeButton: "cursor-pointer" }}
        >
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        {isEditing
                            ? "Edit Recurring Rule"
                            : "New Recurring Rule"}
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <div className="flex justify-around gap-8 mt-2">
                            <ToggleSwitch
                                isSelectingRight={isIncome}
                                onValueChange={setIsIncome}
                                leftLabel="Expense"
                                rightLabel="Income"
                            />
                            {!isEditing && (
                                <ToggleSwitch
                                    isSelectingRight={isBigBuck}
                                    onValueChange={setIsBigBuck}
                                    leftLabel="Small dime"
                                    rightLabel="Big buck"
                                />
                            )}
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
                                    ${isIncome ? "!text-success" : "!text-foreground"}
                                `,
                            }}
                        />

                        <Input
                            classNames={{ input: "font-mono" }}
                            label="Description"
                            value={description}
                            onValueChange={setDescription}
                            maxLength={60}
                            description={`${description.length}/60`}
                        />

                        <div className="flex gap-3 items-end">
                            <Input
                                type="date"
                                label="Start date"
                                value={startDate}
                                onValueChange={setStartDate}
                                isRequired
                            />
                            <div className="flex flex-col gap-1 shrink-0">
                                <span className="text-sm text-default-500">
                                    Frequency
                                </span>
                                <select
                                    value={frequency}
                                    onChange={handleFrequencyChange}
                                    className={selectClasses}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <p className="text-xs text-default-400 font-mono -mt-2">
                            {repeatLabel}
                        </p>

                        <div>
                            <p className="text-sm text-default-500 mb-2">
                                Category
                            </p>
                            {filteredCategories.length === 0 && (
                                <p className="text-sm text-default-400">
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

                        {isEditing && (
                            <Switch
                                isSelected={isActive}
                                onValueChange={setIsActive}
                                size="sm"
                            >
                                <span className="text-sm">Active</span>
                            </Switch>
                        )}
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
