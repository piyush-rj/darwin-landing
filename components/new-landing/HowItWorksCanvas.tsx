"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { PointerCursorIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const COLUMNS = 7;
const SELECT_EVERY_MS = 2200;
const CURSOR_TIP_INSET = 0.15;
const GLIDE_EASE = [0.65, 0, 0.35, 1] as const;

const GRID_REVEAL_SECONDS = 1;
const RING_DELAY_SECONDS = 0.35;
const RING_DRAW_SECONDS = 1.2;
const FIRST_BLOCK_AT_SECONDS = 0.9;
const BLOCK_STEP_SECONDS = 0.8;
const BLOCK_DRAW_SECONDS = 0.6;

type BlockId = "navy" | "cobalt" | "lemon";
type Rect = { column: number; row: number; width: number; height: number };
type Point = { column: number; row: number };

const BLOCK_FILL: Record<BlockId, string> = {
    navy: "bg-[#1E3A8A] mix-blend-multiply",
    cobalt: "bg-[#3B82F6] mix-blend-multiply",
    lemon: "bg-[#FDE047]",
};

const BLOCKS: Record<BlockId, Rect> = {
    navy: { column: 3, row: 1, width: 3, height: 3 },
    cobalt: { column: 1, row: 3, width: 3, height: 3 },
    lemon: { column: 3, row: 5, width: 2, height: 2 },
};

const BLOCK_IDS = Object.keys(BLOCKS) as BlockId[];
const DRAW_ORDER: BlockId[] = ["cobalt", "lemon", "navy"];
const CURSOR_START: Point = { column: COLUMNS + 1, row: COLUMNS + 1 };

function cells(count: number) {
    return `calc(var(--cell) * ${count})`;
}

function containerWidth(count: number) {
    return `${(count * 100) / COLUMNS}cqw`;
}

function rectStyle(rect: Rect): CSSProperties {
    return {
        left: cells(rect.column),
        top: cells(rect.row),
        width: cells(rect.width),
        height: cells(rect.height),
    };
}

function cornersOf(rect: Rect): Point[] {
    return [
        { column: rect.column, row: rect.row },
        { column: rect.column + rect.width, row: rect.row },
        { column: rect.column, row: rect.row + rect.height },
        { column: rect.column + rect.width, row: rect.row + rect.height },
    ];
}

function cursorRestOn(rect: Rect): Point {
    return {
        column: rect.column + rect.width - CURSOR_TIP_INSET,
        row: rect.row + rect.height - CURSOR_TIP_INSET,
    };
}

function blockDrawStart(id: BlockId) {
    return FIRST_BLOCK_AT_SECONDS + DRAW_ORDER.indexOf(id) * BLOCK_STEP_SECONDS;
}

function buildCursorEntry() {
    const stops: { at: number; point: Point }[] = [{ at: 0, point: CURSOR_START }];
    for (const id of DRAW_ORDER) {
        const rect = BLOCKS[id];
        const start = blockDrawStart(id);
        stops.push({ at: start, point: { column: rect.column, row: rect.row } });
        stops.push({ at: start + BLOCK_DRAW_SECONDS, point: cursorRestOn(rect) });
    }
    const totalSeconds = stops[stops.length - 1].at;
    return {
        x: stops.map((stop) => containerWidth(stop.point.column)),
        y: stops.map((stop) => containerWidth(stop.point.row)),
        transition: {
            duration: totalSeconds,
            times: stops.map((stop) => stop.at / totalSeconds),
            ease: "easeInOut" as const,
        },
    };
}

const CURSOR_ENTRY = buildCursorEntry();

export default function HowItWorksCanvas({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.3 });
    const hasEntered = useInView(ref, { amount: 0.3, once: true });
    const reduceMotion = useReducedMotion();
    const [entryFinished, setEntryFinished] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const settled = entryFinished || Boolean(reduceMotion);

    useEffect(() => {
        if (!inView || !settled || reduceMotion) return;
        const timer = window.setInterval(
            () => setSelectedIndex((current) => (current + 1) % BLOCK_IDS.length),
            SELECT_EVERY_MS,
        );
        return () => window.clearInterval(timer);
    }, [inView, settled, reduceMotion]);

    const selectedId = BLOCK_IDS[selectedIndex];
    const selected = BLOCKS[selectedId];
    const cursorRest = cursorRestOn(selected);

    return (
        <div
            ref={ref}
            aria-hidden
            className={cn("relative overflow-hidden bg-[#E8F0FB] @container", className)}
            style={{ "--cell": `calc(100cqw / ${COLUMNS})` } as CSSProperties}
        >
            <motion.div
                className="absolute inset-0 bg-[linear-gradient(to_right,rgb(30_58_138/0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(30_58_138/0.12)_1px,transparent_1px)] bg-size-[var(--cell)_var(--cell)]"
                initial={reduceMotion ? false : { clipPath: "circle(0% at 0% 0%)" }}
                animate={hasEntered ? { clipPath: "circle(150% at 0% 0%)" } : undefined}
                transition={{ duration: GRID_REVEAL_SECONDS, ease: [0.22, 1, 0.36, 1] }}
            />
            <svg
                className="absolute overflow-visible text-[#1E3A8A]/30"
                style={{
                    left: cells(-3.4),
                    top: cells(-3.6),
                    width: cells(6.4),
                    height: cells(6.4),
                }}
            >
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={hasEntered ? { pathLength: 1 } : undefined}
                    transition={{
                        delay: RING_DELAY_SECONDS,
                        duration: RING_DRAW_SECONDS,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                />
            </svg>

            {BLOCK_IDS.map((id) => (
                <motion.div
                    key={id}
                    className={cn("absolute", BLOCK_FILL[id])}
                    style={rectStyle(BLOCKS[id])}
                    initial={reduceMotion ? false : { clipPath: "inset(0% 100% 100% 0%)" }}
                    animate={hasEntered ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
                    transition={{
                        delay: blockDrawStart(id),
                        duration: BLOCK_DRAW_SECONDS,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {settled &&
                cornersOf(selected).map((corner, index) => (
                    <motion.span
                        key={`${selectedId}-${index}`}
                        className="absolute size-2 -translate-1/2 bg-[#1E3A8A]"
                        style={{ left: cells(corner.column), top: cells(corner.row) }}
                        initial={reduceMotion ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.04, duration: 0.25, ease: "backOut" }}
                    />
                ))}

            <motion.div
                className="absolute top-0 left-0"
                initial={
                    reduceMotion
                        ? false
                        : {
                              x: containerWidth(CURSOR_START.column),
                              y: containerWidth(CURSOR_START.row),
                          }
                }
                animate={
                    settled
                        ? {
                              x: containerWidth(cursorRest.column),
                              y: containerWidth(cursorRest.row),
                              transition: { duration: 0.7, ease: GLIDE_EASE },
                          }
                        : hasEntered
                          ? CURSOR_ENTRY
                          : undefined
                }
                onAnimationComplete={() => setEntryFinished(true)}
            >
                <PointerCursorIcon className="size-8 text-white filter-[drop-shadow(0_0_1px_rgb(0_0_0))_drop-shadow(0_6px_8px_rgb(0_0_0/0.25))]" />
            </motion.div>
            <div className="grain-strong pointer-events-none absolute inset-0 opacity-5 invert" />
        </div>
    );
}
