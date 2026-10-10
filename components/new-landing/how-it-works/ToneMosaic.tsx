import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

const COLUMNS = 12;
const ROWS = 8;
const STRENGTHS = [16, 22, 30, 42, 58, 76];

function strengthAt(cell: number) {
    const column = cell % COLUMNS;
    const row = Math.floor(cell / COLUMNS);
    const hash = (column * 73 + row * 151 + column * row * 17) % 97;
    return STRENGTHS[hash % STRENGTHS.length];
}

export default function ToneMosaic({
    tone,
    className,
    cardClassName = "max-w-[22rem]",
    children,
}: {
    tone: string;
    className: string;
    cardClassName?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn("relative w-full overflow-hidden", className)}
            style={{ "--tone": tone } as CSSProperties}
        >
            <div
                aria-hidden
                className="absolute inset-0 grid"
                style={{
                    gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: COLUMNS * ROWS }, (_, cell) => (
                    <span
                        key={cell}
                        className="border-r border-b border-snow/25"
                        style={{
                            background: `color-mix(in oklab, var(--tone) ${strengthAt(cell)}%, var(--color-snow))`,
                        }}
                    />
                ))}
            </div>
            <div className="relative flex items-center justify-center px-5 py-10 sm:absolute sm:inset-0 sm:p-8">
                <div
                    className={cn(
                        "w-full shadow-[0_24px_48px_-24px_rgba(16,24,40,0.45)]",
                        cardClassName,
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
