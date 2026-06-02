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

    const containerClasses = `flex gap-2 p-2 ${isEditing && onDelete ? "justify-between" : "justify-end"}`;

    return (
        <div className={containerClasses}>
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
                {showSubmitTooltip ? (
                    <Tooltip content="Ctrl/Cmd + Enter" placement="left">
                        {submitButton}
                    </Tooltip>
                ) : (
                    submitButton
                )}
                <Button variant="tertiary" onPress={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
