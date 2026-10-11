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

function shuffle<T>(items: T[], random: () => number = Math.random) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index--) {
        const pick = Math.floor(random() * (index + 1));
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

const EMERGE_MS = 820;
const STEP_MS = 210;
const STEP_JITTER_MS = 140;
const SEED_SPREAD_MS = 260;
const SEED_HOLD_MS = 380;
const EMERGE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SLIDE_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

type Emergence = { delay: number; dx: number; dy: number; generation: number };
type Phase = "waiting" | "armed" | "emerging" | "live";

function planEmergence(random: () => number): Emergence[] {
    const plan = new Array<Emergence | undefined>(LAYOUT.length);
    const seeds = shuffle(
        LAYOUT.map((_, cell) => cell),
        random,
    ).slice(0, 2 + Math.floor(random() * 3));
    seeds.forEach((cell) => {
        plan[cell] = { delay: random() * SEED_SPREAD_MS, dx: 0, dy: 0, generation: 0 };
    });

    let frontier = seeds;
    while (frontier.length) {
        const nextFrontier: number[] = [];
        for (const cell of shuffle(frontier, random)) {
            const parent = plan[cell]!;
            const empty = neighbours(cell).filter((neighbour) => !plan[neighbour]);
            const sprouts = shuffle(empty, random).slice(0, 1 + Math.floor(random() * 3));
            for (const sprout of sprouts) {
                plan[sprout] = {
                    delay:
                        parent.delay +
                        STEP_MS +
                        random() * STEP_JITTER_MS +
                        (parent.generation === 0 ? SEED_HOLD_MS : 0),
                    dx: (sprout % COLUMNS) - (cell % COLUMNS),
                    dy: Math.floor(sprout / COLUMNS) - Math.floor(cell / COLUMNS),
                    generation: parent.generation + 1,
                };
                nextFrontier.push(sprout);
            }
            if (empty.length > sprouts.length) nextFrontier.push(cell);
        }
        frontier = nextFrontier;
    }
    return plan as Emergence[];
}

function emergenceStyle(phase: Phase, emergence: Emergence | undefined) {
    if (phase === "live")
        return { transition: `left ${SLIDE_MS}ms ${SLIDE_EASE}, top ${SLIDE_MS}ms ${SLIDE_EASE}` };
    if (!emergence) return { opacity: 0 };
    const hidden = phase !== "emerging";
    const isSeed = emergence.generation === 0;
    return {
        opacity: hidden ? 0 : 1,
        zIndex: 50 - emergence.generation,
        transform: hidden
            ? `translate(${-emergence.dx * 100}%, ${-emergence.dy * 100}%) scale(${isSeed ? 0.4 : 0.92})`
            : "translate(0, 0) scale(1)",
        transition: hidden
            ? "none"
            : `transform ${EMERGE_MS}ms ${EMERGE_EASE} ${emergence.delay}ms, opacity 140ms ease-out ${emergence.delay}ms`,
    };
}

export default function BlockMosaic({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.2 });
    const reduceMotion = useReducedMotion();
    const [cellOfTile, setCellOfTile] = useState(() => LAYOUT.map((_, tile) => tile));
    const [plan, setPlan] = useState<Emergence[] | null>(null);
    const [phase, setPhase] = useState<Phase>("waiting");

    const entry = useRef({ started: false, frame: 0, timer: 0 });

    useEffect(() => {
        const scheduled = entry.current;
        return () => {
            cancelAnimationFrame(scheduled.frame);
            window.clearTimeout(scheduled.timer);
        };
    }, []);

    useEffect(() => {
        const scheduled = entry.current;
        if (!inView || scheduled.started) return;
        scheduled.started = true;
        const nextPlan = planEmergence(Math.random);
        const finish = Math.max(...nextPlan.map((emergence) => emergence.delay)) + EMERGE_MS;
        scheduled.frame = requestAnimationFrame(() => {
            if (reduceMotion) {
                setPhase("live");
                return;
            }
            setPlan(nextPlan);
            setPhase("armed");
            scheduled.frame = requestAnimationFrame(() => {
                scheduled.frame = requestAnimationFrame(() => {
                    setPhase("emerging");
                    scheduled.timer = window.setTimeout(() => setPhase("live"), finish);
                });
            });
        });
    }, [inView, reduceMotion]);

    useEffect(() => {
        if (!inView || reduceMotion || phase !== "live") return;
        const timer = window.setInterval(
            () => setCellOfTile((current) => nextArrangement(current)),
            BEAT_MS,
        );
        return () => window.clearInterval(timer);
    }, [inView, reduceMotion, phase]);

    const live = phase === "live";
    const overlayStyle = { opacity: live ? 1 : 0, transition: "opacity 500ms ease-out" };

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
            className={cn("relative isolate w-full overflow-hidden", className)}
            style={{
                background: live ? TONE_FILL.base : "transparent",
                aspectRatio: `${COLUMNS} / ${ROWS}`,
            }}
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
                            ...emergenceStyle(phase, plan?.[tile]),
                        }}
                    >
                        {tone === "diamond" && (
                            <span
                                className="block size-[70%]"
                                style={{
                                    background: TONE_FILL.deeper,
                                    transform:
                                        phase === "emerging" || live
                                            ? "rotate(45deg)"
                                            : "rotate(-45deg) scale(0.5)",
                                    transition: `transform ${EMERGE_MS * 1.4}ms ${EMERGE_EASE} ${(plan?.[tile]?.delay ?? 0) + EMERGE_MS * 0.4}ms`,
                                }}
                            />
                        )}
                    </div>
                );
            })}

            {Array.from({ length: COLUMNS - 1 }, (_, line) => (
                <span
                    key={`column-${line}`}
                    className="pointer-events-none absolute inset-y-0 z-[60] w-px"
                    style={{
                        left: `${((line + 1) / COLUMNS) * 100}%`,
                        background: SEAM,
                        ...overlayStyle,
                    }}
                />
            ))}
            {Array.from({ length: ROWS - 1 }, (_, line) => (
                <span
                    key={`row-${line}`}
                    className="pointer-events-none absolute inset-x-0 z-[60] h-px"
                    style={{
                        top: `${((line + 1) / ROWS) * 100}%`,
                        background: SEAM,
                        ...overlayStyle,
                    }}
                />
            ))}

            <div
                className="pointer-events-none absolute z-[60] border"
                style={{ ...cropStyle, borderColor: CROP_LINE, ...overlayStyle }}
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
