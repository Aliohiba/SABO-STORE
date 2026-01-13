import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface BackButtonProps {
    href: string;
    label?: string;
}

export default function BackButton({ href, label = "العودة" }: BackButtonProps) {
    return (
        <Link href={href}>
            <button className="inline-flex items-center gap-3 group mb-4 transition-all hover:gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-gray-300 transition-all">
                    <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                </div>
                <span className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors">
                    {label}
                </span>
            </button>
        </Link>
    );
}
