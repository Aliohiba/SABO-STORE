import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SupportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultEmail?: string;
}

export function SupportDialog({ open, onOpenChange, defaultEmail }: SupportDialogProps) {
    const { t } = useTranslation();
    const { data: user } = trpc.customer.me.useQuery();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    // Pre-fill user data when loaded or opened
    useEffect(() => {
        if (open) {
            if (user) {
                setName(user.name || "");
                setEmail(user.email || "");
            } else if (defaultEmail) {
                // If coming from a context where we know the email (unlikely for footer click, but good for flexibility)
                setEmail(defaultEmail);
            }
        }
    }, [user, open, defaultEmail]);

    const createMutation = trpc.support.create.useMutation({
        onSuccess: () => {
            toast.success(t('support.message_sent_success', 'تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.'));
            onOpenChange(false);
            // Reset form (optional, or keep generic fields?)
            setSubject("");
            setMessage("");
            if (!user) {
                setName("");
                setEmail("");
            }
        },
        onError: (err) => {
            toast.error(err.message || t('support.message_sent_error', 'حدث خطأ أثناء إرسال الرسالة.'));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !subject || !message) {
            toast.error(t('support.fill_all_fields', 'يرجى ملء جميع الحقول المطلوبة'));
            return;
        }

        createMutation.mutate({
            name,
            email,
            subject,
            message
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{t('support.contact_us', 'تواصل معنا')}</DialogTitle>
                    <DialogDescription>
                        {t('support.description', 'لديك استفسار؟ املأ النموذج أدناه وسيقوم فريق الدعم بالرد عليك.')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('support.name', 'الاسم')}</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('support.name_placeholder', 'اسمك الكامل')}
                                disabled={!!user?.name} // Lock name if logged in? Maybe allow edit. Let's allow edit.
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('support.email', 'البريد الإلكتروني')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@domain.com"
                                disabled={!!user?.email} // Lock email if logged in to prevent spoofing identity mismatch with account? Actually schema doesn't enforce link.
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">{t('support.subject', 'الموضوع')}</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder={t('support.subject_placeholder', 'عنوان رسالتك')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">{t('support.message', 'الرسالة')}</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('support.message_placeholder', 'اكتب تفاصيل استفسارك هنا...')}
                            className="min-h-[120px] resize-none"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto gap-2">
                            {createMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {t('support.send_btn', 'إرسال الرسالة')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
