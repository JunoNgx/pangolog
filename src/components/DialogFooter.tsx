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
        <Button type="submit" color="primary" isLoading={isSubmitting}>
            {isEditing ? "Save" : "Create"}
        </Button>
    );

    const containerClasses = `flex gap-2 py-2 ${isEditing && onDelete ? "justify-between" : "justify-end"}`;

    return (
        <div className={containerClasses}>
            {isEditing && onDelete && (
                <Button
                    color="danger"
                    variant="light"
                    isLoading={isDeleting}
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
                <Button variant="light" onPress={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
