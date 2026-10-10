import { cn } from "@/lib/utils";

export const RULER_TICKS =
    "bg-[repeating-linear-gradient(to_right,color-mix(in_oklab,var(--color-foreground)_22%,transparent)_0_1px,transparent_1px_8px)]";

function RegistrationMark({ className }: { className: string }) {
    return (
        <span
            aria-hidden
            className={cn("absolute top-1/2 size-3 -translate-y-1/2 text-neutral-400", className)}
        >
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
        </span>
    );
}

export default function SectionDivider() {
    return (
        <div aria-hidden className="relative h-10 w-full border-b border-edge md:h-12">
            <RegistrationMark className="left-3" />
            <span className={cn("absolute inset-x-8 top-1/2 h-2 -translate-y-1/2", RULER_TICKS)} />
            <RegistrationMark className="right-3" />
        </div>
    );
}
