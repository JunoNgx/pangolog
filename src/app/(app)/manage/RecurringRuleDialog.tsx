"use client";

import { Button, Dropdown, Input, Label, Modal, Switch } from "@heroui/react";
import { Banknote, Coins } from "lucide-react";
import { DateTime } from "luxon";
import {
    type SubmitEventHandler,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AmountInput } from "@/components/AmountInput";
import { CategoryDialog } from "@/components/CategoryDialog";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DialogFooter } from "@/components/DialogFooter";
import { FocusSink } from "@/components/FocusSink";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { DAY_NAMES_FULL, MONTH_NAMES } from "@/lib/constants";
import type { RecurringRule } from "@/lib/db/types";
import { useCategories } from "@/lib/hooks/useCategories";
import { useDelayedAutoFocus } from "@/lib/hooks/useDelayedAutoFocus";
import {
    useCreateRecurringRule,
    useDeleteRecurringRule,
    useRestoreRecurringRule,
    useUpdateRecurringRule,
} from "@/lib/hooks/useRecurringRules";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import type { Frequency } from "@/lib/types";
import {
    fromDateInputValue,
    getLocaleDateFormat,
    isAndroid,
    showDeleteToast,
    toDateInputValue,
    todayDateString,
} from "@/lib/utils";

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
];

function getRepeatLabel(frequency: Frequency, dateStr: string): string {
    const dt = DateTime.fromISO(`${dateStr}T12:00:00`);
    switch (frequency) {
        case "daily":
            return "Repeats every day";
        case "weekly":
            return `Repeats every ${DAY_NAMES_FULL[dt.weekday % 7]}`;
        case "monthly":
            return `Repeats on the ${dt.day} of each month`;
        case "yearly":
            return `Repeats every ${MONTH_NAMES[dt.month - 1]} ${dt.day}`;
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
    const [isBigBuck, setIsBigBuck] = useState(true);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [startDate, setStartDate] = useState(todayDateString());
    const [isActive, setIsActive] = useState(true);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    const amountInputRef = useRef<HTMLInputElement>(null);
    useDelayedAutoFocus({
        isOpen,
        ref: amountInputRef,
        shouldApplyDelayedFocus: isAndroid(),
    });
    const [shouldUseFocusSink, setShouldUseFocusSink] = useState(false);
    useLayoutEffect(() => {
        setShouldUseFocusSink(isAndroid());
    }, []);
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

    function handleFrequencySelectionChange(keys: "all" | Set<React.Key>) {
        if (keys === "all") return;
        const key = Array.from(keys)[0] as Frequency;
        if (!key) return;
        setFrequency(key);
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
                showDeleteToast("Rule", () => restoreRule.mutate(id));
            },
        });
    }

    const { isExpenseOnlyMode } = useProfileSettingsStore();
    const isPending = createRule.isPending || updateRule.isPending;
    const isDeleting = deleteRule.isPending;
    const repeatLabel = getRepeatLabel(frequency, startDate);

    const frequencyDropdown = (
        <div className="flex shrink-0 flex-col gap-1">
            <span className="text-foreground text-sm">Frequency</span>
            <Dropdown>
                <Button variant="outline" size="sm">
                    {FREQUENCY_OPTIONS.find((o) => o.value === frequency)
                        ?.label ?? frequency}
                </Button>
                <Dropdown.Popover
                    className="w-fit min-w-0"
                    placement="bottom end"
                >
                    <Dropdown.Menu
                        aria-label="Frequency"
                        selectionMode="single"
                        selectedKeys={new Set([frequency])}
                        onSelectionChange={handleFrequencySelectionChange}
                    >
                        {FREQUENCY_OPTIONS.map((opt) => (
                            <Dropdown.Item
                                id={opt.value}
                                key={opt.value}
                                textValue={opt.label}
                            >
                                {opt.label}
                                <Dropdown.ItemIndicator />
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        </div>
    );

    const isTxTypeSwitchVisible = !isExpenseOnlyMode;

    const ruleStatusPanel = isEditing && rule && (
        <div className="bg-surface-tertiary flex items-center justify-between rounded-lg border p-3">
            <div className="flex flex-col gap-1">
                <Switch isSelected={isActive} onChange={setIsActive}>
                    <Switch.Control>
                        <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Content>
                        <Label>{isActive ? "Active" : "Paused"}</Label>
                    </Switch.Content>
                </Switch>
            </div>
            <div className="text-muted flex flex-col items-end gap-1 font-mono text-xs">
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

    const typeToggleRow = isTxTypeSwitchVisible && (
        <div className="mt-2 flex justify-center">
            <ToggleSwitch
                label="Transaction flow type"
                isSelectingRight={isIncome}
                onValueChange={setIsIncome}
                leftLabel="Expense"
                rightLabel="Income"
            />
        </div>
    );

    const expenseTypeToggleRow = (
        <div className="mt-2 flex justify-center">
            <ToggleSwitch
                label="Transaction type"
                isSelectingRight={isBigBuck}
                onValueChange={setIsBigBuck}
                leftLabel="Small dime"
                rightLabel="Big buck"
                leftIcon={Coins}
                rightIcon={Banknote}
            />
        </div>
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
            >
                <Modal.Trigger tabIndex={-1}>
                    <span hidden />
                </Modal.Trigger>
                <Modal.Backdrop>
                    <Modal.Container>
                        <Modal.Dialog>
                            <FocusSink isEnabled={shouldUseFocusSink} />
                            <Modal.CloseTrigger className="cursor-pointer" />
                            <form onSubmit={handleSubmit}>
                                <Modal.Header>
                                    <Modal.Heading>
                                        {isEditing
                                            ? "Edit Recurring Rule"
                                            : "New Recurring Rule"}
                                    </Modal.Heading>
                                </Modal.Header>
                                <Modal.Body>
                                    {ruleStatusPanel}
                                    {typeToggleRow}
                                    {expenseTypeToggleRow}

                                    <AmountInput
                                        ref={amountInputRef}
                                        value={amount}
                                        onChange={setAmount}
                                        isIncome={isIncome}
                                    />

                                    <div className="flex flex-col gap-1">
                                        <Label
                                            htmlFor="description"
                                            className="sr-only"
                                        >
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            className="font-mono"
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            maxLength={60}
                                            placeholder="Description"
                                        />
                                    </div>

                                    <div className="flex items-end justify-between gap-3">
                                        <div className="flex w-1/2 flex-col gap-1">
                                            <Label htmlFor="startDate">
                                                Start date
                                                <span className="text-muted ml-2 font-mono text-xs">
                                                    {localeDateFormat}
                                                </span>
                                            </Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) =>
                                                    setStartDate(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        {frequencyDropdown}
                                    </div>

                                    <p className="-mt-2 font-mono text-xs">
                                        {repeatLabel}
                                    </p>

                                    <CategoryPicker
                                        categories={filteredCategories}
                                        selectedId={categoryId}
                                        onChange={setCategoryId}
                                        onAdd={() =>
                                            setIsCategoryDialogOpen(true)
                                        }
                                    />
                                </Modal.Body>
                                <Modal.Footer>
                                    <DialogFooter
                                        isEditing={isEditing}
                                        onCancel={handleClose}
                                        onDelete={
                                            isEditing ? handleDelete : undefined
                                        }
                                        isSubmitting={isPending}
                                        isDeleting={isDeleting}
                                    />
                                </Modal.Footer>
                            </form>
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
