import { useState, useCallback } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface UseConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
}

export function useConfirm() {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<UseConfirmOptions>({
        title: "",
        message: ""
    });
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: UseConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(true);
        }
        setIsOpen(false);
    }, [resolvePromise]);

    const handleCancel = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(false);
        }
        setIsOpen(false);
    }, [resolvePromise]);

    const ConfirmDialogComponent = useCallback(() => (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            title={options.title}
            message={options.message}
            confirmText={options.confirmText}
            cancelText={options.cancelText}
            type={options.type}
            storeLogo="/logo.png"
        />
    ), [isOpen, options, handleConfirm, handleCancel]);

    return {
        confirm,
        ConfirmDialog: ConfirmDialogComponent
    };
}
