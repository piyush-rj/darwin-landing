import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { cn } from "@/lib/utils";

export default function QuestionCardHeader({ label }: { label: string }) {
    return (
        <div className="mb-2 flex items-center gap-2.5 text-[11.5px] font-medium text-neutral-500">
            <DarwinBlockLogo className={cn("size-5 shrink-0", DARWIN_LOGO_BRAND_COLOR)} />
            {label}
        </div>
    );
}
