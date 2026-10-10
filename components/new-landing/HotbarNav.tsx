import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import type { PixelGlyph } from "./PixelGlyphs";

export type HotbarItem = {
    id: string;
    label: string;
    icon: PixelGlyph;
    tone: string;
};

function slotBevel(selected: boolean) {
    const ring = selected
        ? "color-mix(in oklab, var(--slot-tone) 45%, transparent)"
        : "var(--color-edge)";
    return [
        "inset 3px 3px 0 color-mix(in oklab, var(--color-black) 16%, transparent)",
        "inset -3px -3px 0 color-mix(in oklab, var(--color-snow) 80%, var(--color-white))",
        `0 0 0 1px ${ring}`,
    ].join(", ");
}

export default function HotbarNav({
    label,
    items,
    active,
}: {
    label: string;
    items: HotbarItem[];
    active: number;
}) {
    return (
        <nav aria-label={label} className="sticky top-20 flex flex-col gap-3">
            {items.map((item, index) => {
                const selected = index === active;
                return (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        aria-current={selected ? "true" : undefined}
                        className="group flex items-center gap-4"
                        style={{ "--slot-tone": item.tone } as CSSProperties}
                    >
                        <span
                            className={cn(
                                "relative flex size-11 shrink-0 items-center justify-center transition-colors",
                                selected
                                    ? "bg-[color-mix(in_oklab,var(--slot-tone)_16%,var(--color-mist))] text-(--slot-tone)"
                                    : "bg-mist text-neutral-500 group-hover:text-foreground",
                            )}
                            style={{ boxShadow: slotBevel(selected) }}
                        >
                            <item.icon />
                        </span>
                        <span className="flex flex-col">
                            <span className="font-mono text-[10px] tracking-[0.12em] text-neutral-400">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <span
                                className={cn(
                                    "text-[15px] transition-colors",
                                    selected
                                        ? "text-foreground"
                                        : "text-neutral-500 group-hover:text-foreground",
                                )}
                            >
                                {item.label}
                            </span>
                        </span>
                    </a>
                );
            })}
        </nav>
    );
}
