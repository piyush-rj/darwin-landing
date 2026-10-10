"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const COLUMNS = 10;
const ROWS = 4;
const BEAT_MS = 1600;
const SLIDE_MS = 900;
const SWAPS_PER_BEAT = 7;

type Tone = "base" | "deep" | "deeper" | "light" | "diamond";

const TONE_FILL: Record<Exclude<Tone, "diamond">, string> = {
    base: "var(--color-primary)",
    deep: "color-mix(in oklab, var(--color-primary) 88%, var(--color-black))",
    deeper: "color-mix(in oklab, var(--color-primary) 76%, var(--color-black))",
    light: "color-mix(in oklab, var(--color-primary) 55%, var(--color-snow))",
};

const LAYOUT: Tone[] = [
    "base",
    "base",
    "deep",
    "deeper",
    "base",
    "light",
    "base",
    "diamond",
    "base",
    "base",
    "base",
    "base",
    "light",
    "deeper",
    "deep",
    "deeper",
    "deeper",
    "deep",
    "base",
    "base",
    "base",
    "base",
    "deep",
    "base",
    "deeper",
    "base",
    "deep",
    "base",
    "base",
    "base",
    "base",
    "deeper",
    "deeper",
    "base",
    "deep",
    "base",
    "deeper",
    "light",
    "base",
    "deep",
];

const SEAM = "color-mix(in oklab, var(--color-primary) 86%, var(--color-black))";
const CROP_LINE = "color-mix(in oklab, var(--color-primary) 55%, var(--color-black))";

const ACCENTS = LAYOUT.flatMap((tone, tile) => (tone === "base" ? [] : [tile]));

function neighbours(cell: number) {
    const column = cell % COLUMNS;
    const row = Math.floor(cell / COLUMNS);
    return [
        column > 0 ? cell - 1 : -1,
        column < COLUMNS - 1 ? cell + 1 : -1,
        row > 0 ? cell - COLUMNS : -1,
        row < ROWS - 1 ? cell + COLUMNS : -1,
    ].filter((neighbour) => neighbour >= 0);
}

function shuffle<T>(items: T[]) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index--) {
        const pick = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[pick]] = [copy[pick], copy[index]];
    }
    return copy;
}

function nextArrangement(cellOfTile: number[]) {
    const tileAtCell = new Array<number>(cellOfTile.length);
    cellOfTile.forEach((cell, tile) => {
        tileAtCell[cell] = tile;
    });
    const busy = new Set<number>();
    const next = cellOfTile.slice();
    let swaps = 0;
    for (const tile of shuffle(ACCENTS)) {
        if (swaps === SWAPS_PER_BEAT) break;
        const cell = cellOfTile[tile];
        if (busy.has(cell)) continue;
        const target = shuffle(neighbours(cell)).find(
            (neighbour) => !busy.has(neighbour) && LAYOUT[tileAtCell[neighbour]] !== LAYOUT[tile],
        );
        if (target === undefined) continue;
        const other = tileAtCell[target];
        next[tile] = target;
        next[other] = cell;
        busy.add(cell);
        busy.add(target);
        swaps++;
    }
    return next;
}

const CROP = { left: 1, right: 9, top: 1, bottom: 3 };

export default function BlockMosaic({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.2 });
    const reduceMotion = useReducedMotion();
    const [cellOfTile, setCellOfTile] = useState(() => LAYOUT.map((_, tile) => tile));

    useEffect(() => {
        if (!inView || reduceMotion) return;
        const timer = window.setInterval(
            () => setCellOfTile((current) => nextArrangement(current)),
            BEAT_MS,
        );
        return () => window.clearInterval(timer);
    }, [inView, reduceMotion]);

    const cropStyle = {
        left: `${(CROP.left / COLUMNS) * 100}%`,
        right: `${((COLUMNS - CROP.right) / COLUMNS) * 100}%`,
        top: `${(CROP.top / ROWS) * 100}%`,
        bottom: `${((ROWS - CROP.bottom) / ROWS) * 100}%`,
    };

    return (
        <div
            ref={ref}
            aria-hidden
            className={cn("relative w-full overflow-hidden", className)}
            style={{ background: TONE_FILL.base, aspectRatio: `${COLUMNS} / ${ROWS}` }}
        >
            {LAYOUT.map((tone, tile) => {
                const cell = cellOfTile[tile];
                return (
                    <div
                        key={tile}
                        className="absolute flex items-center justify-center"
                        style={{
                            left: `${((cell % COLUMNS) / COLUMNS) * 100}%`,
                            top: `${(Math.floor(cell / COLUMNS) / ROWS) * 100}%`,
                            width: `${100 / COLUMNS}%`,
                            height: `${100 / ROWS}%`,
                            background: tone === "diamond" ? TONE_FILL.base : TONE_FILL[tone],
                            transition: `left ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1), top ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                        }}
                    >
                        {tone === "diamond" && (
                            <span
                                className="block size-[70%] rotate-45"
                                style={{ background: TONE_FILL.deeper }}
                            />
                        )}
                    </div>
                );
            })}

            {Array.from({ length: COLUMNS - 1 }, (_, line) => (
                <span
                    key={`column-${line}`}
                    className="pointer-events-none absolute inset-y-0 w-px"
                    style={{ left: `${((line + 1) / COLUMNS) * 100}%`, background: SEAM }}
                />
            ))}
            {Array.from({ length: ROWS - 1 }, (_, line) => (
                <span
                    key={`row-${line}`}
                    className="pointer-events-none absolute inset-x-0 h-px"
                    style={{ top: `${((line + 1) / ROWS) * 100}%`, background: SEAM }}
                />
            ))}

            <div
                className="pointer-events-none absolute border"
                style={{ ...cropStyle, borderColor: CROP_LINE }}
            >
                {[
                    "-top-[3px] -left-[3px]",
                    "-top-[3px] -right-[3px]",
                    "-bottom-[3px] -left-[3px]",
                    "-bottom-[3px] -right-[3px]",
                ].map((position) => (
                    <span key={position} className={cn("absolute size-1.5 bg-black", position)} />
                ))}
            </div>
        </div>
    );
}
