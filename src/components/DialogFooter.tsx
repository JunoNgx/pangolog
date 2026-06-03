"use client";

import { Button, Tooltip } from "@heroui/react";

interface DialogFooterProps {
    isEditing: boolean;
    onCancel: () => void;
    onDelete?: () => void;
    isSubmitting: boolean;
    isDeleting?: boolean;
    showSubmitTooltip?: boolean;
}

export function DialogFooter({
    isEditing,
    onCancel,
    onDelete,
    isSubmitting,
    isDeleting,
    showSubmitTooltip,
}: DialogFooterProps) {
    const submitButton = (
        <Button type="submit" variant="primary" isPending={isSubmitting}>
            {isEditing ? "Save" : "Create"}
        </Button>
    );

    return (
        <div
            className={`flex gap-2 pt-4 ${isEditing && onDelete ? "justify-between" : "justify-end"}`}
        >
            {isEditing && onDelete && (
                <Button
                    variant="danger-soft"
                    isPending={isDeleting}
                    onPress={onDelete}
                >
                    Delete
                </Button>
            )}
            <div className="flex gap-2">
                <Button variant="tertiary" onPress={onCancel}>
                    Cancel
                </Button>
                {showSubmitTooltip ? (
                    <Tooltip delay={0}>
                        {submitButton}
                        <Tooltip.Content placement="left">
                            Ctrl/Cmd + Enter
                        </Tooltip.Content>
                    </Tooltip>
                ) : (
                    submitButton
                )}
            </div>
        </div>
    );
}
