"use client";

import {
    Button,
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import { type FormEvent, useEffect, useState } from "react";
import type { Category } from "@/lib/db/types";
import {
    useCreateCategory,
    useUpdateCategory,
} from "@/lib/hooks/useCategories";

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
}

export function CategoryDialog({
    isOpen,
    onClose,
    category,
}: CategoryDialogProps) {
    const [name, setName] = useState("");
    const [colour, setColour] = useState("#6366f1");
    const [icon, setIcon] = useState("");

    const [isIncomeOnly, setIsIncomeOnly] = useState(false);
    const [isBuckOnly, setIsBuckOnly] = useState(false);

    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const isEditing = !!category;

    useEffect(() => {
        if (category) {
            setName(category.name);
            setColour(category.colour);
            setIcon(category.icon);

            setIsIncomeOnly(category.isIncomeOnly);
            setIsBuckOnly(category.isBuckOnly);
        } else {
            setName("");
            setColour("#6366f1");
            setIcon("");

            setIsIncomeOnly(false);
            setIsBuckOnly(false);
        }
    }, [category]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const input = {
            name,
            colour,
            icon,
            priority: category?.priority ?? 0,
            isIncomeOnly,
            isBuckOnly,
        };

        if (isEditing) {
            updateCategory.mutate(
                { id: category.id, input },
                { onSuccess: onClose },
            );
        } else {
            createCategory.mutate(input, { onSuccess: onClose });
        }
    }

    const isPending = createCategory.isPending || updateCategory.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        {isEditing ? "Edit Category" : "New Category"}
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <Input
                            label="Name"
                            value={name}
                            onValueChange={setName}
                            isRequired
                            autoFocus
                        />
                        <Input
                            label="Icon"
                            placeholder="e.g. 🍔"
                            value={icon}
                            onValueChange={setIcon}
                        />
                        <Input
                            label="Colour"
                            type="color"
                            value={colour}
                            onValueChange={setColour}
                        />

                        <Checkbox
                            isSelected={isIncomeOnly}
                            onValueChange={setIsIncomeOnly}
                        >
                            Income only
                        </Checkbox>
                        <Checkbox
                            isSelected={isBuckOnly}
                            onValueChange={setIsBuckOnly}
                        >
                            Big-buck only
                        </Checkbox>
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
