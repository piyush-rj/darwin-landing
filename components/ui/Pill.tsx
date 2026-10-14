import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PillTone = "neutral" | "muted" | "brand" | "positive" | "faint";
type PillSize = "sm" | "md";

const TONE: Record<PillTone, string> = {
    neutral: "text-neutral-200",
    muted: "text-overlay/50",
    brand: "text-primary",
    positive: "bg-green-500/40 text-green-200",
    faint: "text-overlay/45",
};

const SIZE: Record<PillSize, string> = {
    sm: "px-1.5 text-[10px] leading-[1.5]",
    md: "h-5.5 px-2 text-[12px] leading-5",
};

/** A small rounded label. `dotColor` prepends a coloured dot, the way a tag reads. */
export default function Pill({
    tone = "neutral",
    size = "md",
    dotColor,
    children,
    className,
}: {
    tone?: PillTone;
    size?: PillSize;
    dotColor?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-sm",
                TONE[tone],
                SIZE[size],
                className,
            )}
        >
            {dotColor && (
                <span
                    style={{ backgroundColor: dotColor }}
                    className="size-2 shrink-0 rounded-full"
                    aria-hidden
                />
            )}
            {children}
        </span>
    );
}
