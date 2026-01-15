import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = "rtl";
        document.documentElement.lang = lng;
        localStorage.setItem('i18nextLng', lng);
    };

    const LibyaFlag = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" className="w-6 h-6 rounded-sm shadow-sm object-cover">
            <rect width="36" height="6" fill="#E70013" />
            <rect y="6" width="36" height="12" fill="#000" />
            <rect y="18" width="36" height="6" fill="#239E46" />
            <path d="M18,9.5a2.5,2.5,0,1,0,2.5,2.5A2.5,2.5,0,0,0,18,9.5Zm1.2,1.8l.2.8h.8l-.7.5.3.8-.7-.5-.7.5.3-.8-.7-.5h.8Z" fill="#FFF" transform="translate(-1 0) scale(1.1)" />
        </svg>
    );

    const UKFlag = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" className="w-6 h-6 rounded-sm shadow-sm object-cover">
            <rect width="36" height="24" fill="#012169" />
            <path d="M0 0l36 24M36 0L0 24" stroke="#fff" strokeWidth="3.6" />
            <path d="M0 0l36 24M36 0L0 24" stroke="#C8102E" strokeWidth="2.4" />
            <path d="M18 0v24M0 12h36" stroke="#fff" strokeWidth="6" />
            <path d="M18 0v24M0 12h36" stroke="#C8102E" strokeWidth="3.6" />
        </svg>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="group rounded-full w-10 h-10 hover:bg-muted border border-transparent hover:border-border transition-all">
                    <span className="flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                        {i18n.language === "en" ? <UKFlag /> : <LibyaFlag />}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => changeLanguage("ar")} className="justify-between cursor-pointer py-2">
                    <span className="font-medium text-sm">العربية</span>
                    <LibyaFlag />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("en")} className="justify-between cursor-pointer py-2">
                    <span className="font-medium text-sm">English</span>
                    <UKFlag />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
