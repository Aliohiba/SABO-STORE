import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function OfferCountdown({ endTime, compact = false }: { endTime: string | Date, compact?: boolean }) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(endTime) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (!timeLeft) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</span>
            </div>
        );
    }

    return (
        <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 my-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-sm">ينتهي العرض خلال:</span>
            </div>
            <div className="flex gap-2 justify-center text-center direction-ltr" dir="ltr">
                {[
                    { label: "يوم", value: timeLeft.days },
                    { label: "ساعة", value: timeLeft.hours },
                    { label: "دقيقة", value: timeLeft.minutes },
                    { label: "ثانية", value: timeLeft.seconds },
                ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-card border border-border p-2 rounded shadow-sm min-w-[50px]">
                        <span className="font-bold text-lg text-destructive leading-none">{item.value}</span>
                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
