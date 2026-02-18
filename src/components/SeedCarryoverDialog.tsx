"use client";

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";

interface SeedCarryoverDialogProps {
    isOpen: boolean;
    onResolve: (carryOver: boolean) => void;
}

export function SeedCarryoverDialog({
    isOpen,
    onResolve,
}: SeedCarryoverDialogProps) {
    return (
        <Modal isOpen={isOpen} hideCloseButton isDismissable={false}>
            <ModalContent>
                <ModalHeader>Sync demo data?</ModalHeader>
                <ModalBody>
                    <p className="font-mono text-sm text-default-600">
                        You have demo data from when you first opened Pangolog.
                        Do you want to carry it over to Google Drive, or discard
                        it before syncing?
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="light"
                        color="danger"
                        onPress={() => onResolve(false)}
                    >
                        Discard
                    </Button>
                    <Button color="primary" onPress={() => onResolve(true)}>
                        Keep it
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
