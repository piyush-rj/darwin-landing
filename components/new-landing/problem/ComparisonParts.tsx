import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { HARD_SHADOW } from "../boxStyles";

export const META = "font-mono text-[11px] tracking-[0.14em] text-neutral-400 uppercase";

const ROW_FADE = [1, 1, 1, 0.5, 0.22];

export function PanelTag({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex h-6 items-center gap-1.5 border border-foreground/15 bg-snow/60 px-2 font-mono text-[10px] tracking-[0.12em] text-foreground/70 uppercase",
                className,
            )}
        >
            {children}
        </span>
    );
}

export function PanelHeading({
    title,
    caption,
    inverse = false,
}: {
    title: string;
    caption: string;
    inverse?: boolean;
}) {
    return (
        <div className="mt-5">
            <h3
                className={cn(
                    "text-[24px] leading-tight font-semibold tracking-[-0.025em]",
                    inverse ? "text-white" : "text-foreground",
                )}
            >
                {title}
            </h3>
            <p className={cn("mt-1.5 text-[15px]", inverse ? "text-white/75" : "text-neutral-500")}>
                {caption}
            </p>
        </div>
    );
}

export function CardShell({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("p-1.5", className)}>
            <div
                className={cn(
                    "border border-edge bg-snow px-5 pt-6 pb-3 sm:px-7 sm:pt-7",
                    HARD_SHADOW,
                )}
            >
                {children}
            </div>
        </div>
    );
}

export function IssueRow({
    tile,
    title,
    meta,
    index,
}: {
    tile: ReactNode;
    title: string;
    meta: string;
    index: number;
}) {
    return (
        <div
            className="flex h-[43px] items-center gap-3 border-b border-dashed border-edge"
            style={{ opacity: ROW_FADE[index] ?? 0 }}
        >
            {tile}
            <span className="min-w-0 truncate text-[14px] text-foreground">{title}</span>
            <span className={cn(META, "ml-auto shrink-0")}>{meta}</span>
        </div>
    );
}
