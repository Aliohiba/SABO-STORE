import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    storeLogo?: string;
    type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "تأكيد",
    cancelText = "إلغاء",
    storeLogo,
    type = "danger"
}: ConfirmDialogProps) {

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const typeColors = {
        danger: {
            badge: "bg-destructive/10 text-destructive",
            icon: "bg-destructive/5 text-destructive",
            button: "bg-destructive hover:bg-destructive/90"
        },
        warning: {
            badge: "bg-yellow-500/10 text-yellow-600",
            icon: "bg-yellow-500/5 text-yellow-600",
            button: "bg-yellow-600 hover:bg-yellow-700 text-white"
        },
        info: {
            badge: "bg-primary/10 text-primary",
            icon: "bg-primary/5 text-primary",
            button: "bg-primary hover:bg-primary/90"
        }
    };

    const colors = typeColors[type] || typeColors.danger;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Dialog */}
            <div
                className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-2 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* Header with Logo */}
                <div className="pt-8 pb-6 px-6 text-center border-b border-border">
                    {storeLogo && (
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-background flex items-center justify-center shadow-sm">
                                <img
                                    src={storeLogo}
                                    alt="Store Logo"
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-foreground mb-2">
                        {title}
                    </h3>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        يتطلب تأكيد
                    </div>
                </div>

                {/* Message */}
                <div className="px-6 py-6">
                    <p className="text-muted-foreground text-center leading-relaxed text-base">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 h-12 text-base border-2 hover:bg-muted"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 h-12 text-base text-white shadow-lg ${colors.button} transform active:scale-95 transition-all`}
                    >
                        {confirmText}
                    </Button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-500/5 to-orange-500/5 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
}
