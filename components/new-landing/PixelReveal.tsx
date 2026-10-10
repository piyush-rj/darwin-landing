"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const TILE_VANISH_MS = 420;
const TILE_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

type TileGrid = { columns: number; rows: number; delays: number[] };
type Phase = "covered" | "tiled" | "revealing" | "done";

function orthogonalNeighbours(cell: number, columns: number, rows: number) {
    const column = cell % columns;
    const row = Math.floor(cell / columns);
    return [
        column > 0 ? cell - 1 : -1,
        column < columns - 1 ? cell + 1 : -1,
        row > 0 ? cell - columns : -1,
        row < rows - 1 ? cell + columns : -1,
    ].filter((neighbour) => neighbour >= 0);
}

function shuffled<T>(items: T[]) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index--) {
        const pick = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[pick]] = [copy[pick], copy[index]];
    }
    return copy;
}

function floodDelays(columns: number, rows: number, startMs: number, spreadMs: number) {
    const total = columns * rows;
    const generation = new Array<number>(total).fill(-1);
    const seeds = shuffled(Array.from({ length: total }, (_, cell) => cell)).slice(
        0,
        1 + Math.floor(Math.random() * 3),
    );
    seeds.forEach((cell) => (generation[cell] = 0));

    let frontier = seeds;
    while (frontier.length) {
        const nextFrontier: number[] = [];
        for (const cell of shuffled(frontier)) {
            const empty = orthogonalNeighbours(cell, columns, rows).filter(
                (neighbour) => generation[neighbour] < 0,
            );
            const sprouts = shuffled(empty).slice(0, 1 + Math.floor(Math.random() * 3));
            for (const sprout of sprouts) {
                generation[sprout] = generation[cell] + 1;
                nextFrontier.push(sprout);
            }
            if (empty.length > sprouts.length) nextFrontier.push(cell);
        }
        frontier = nextFrontier;
    }

    const deepest = Math.max(1, ...generation);
    const step = spreadMs / deepest;
    return generation.map((depth) => startMs + depth * step + Math.random() * step * 0.6);
}

export default function PixelReveal({
    cover,
    tileSize = 28,
    startMs = 0,
    spreadMs = 900,
    className,
}: {
    cover: string;
    tileSize?: number;
    startMs?: number;
    spreadMs?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });
    const [grid, setGrid] = useState<TileGrid | null>(null);
    const [phase, setPhase] = useState<Phase>("covered");
    const scheduled = useRef({ started: false, frame: 0, timer: 0 });

    useEffect(() => {
        const pending = scheduled.current;
        return () => {
            cancelAnimationFrame(pending.frame);
            window.clearTimeout(pending.timer);
        };
    }, []);

    useEffect(() => {
        const pending = scheduled.current;
        const element = ref.current;
        if (!inView || !element || pending.started) return;
        pending.started = true;
        const columns = Math.max(1, Math.round(element.offsetWidth / tileSize));
        const rows = Math.max(1, Math.round(element.offsetHeight / tileSize));
        const delays = floodDelays(columns, rows, startMs, spreadMs);
        const finish = Math.max(...delays) + TILE_VANISH_MS;
        pending.frame = requestAnimationFrame(() => {
            setGrid({ columns, rows, delays });
            setPhase("tiled");
            pending.frame = requestAnimationFrame(() => {
                pending.frame = requestAnimationFrame(() => {
                    setPhase("revealing");
                    pending.timer = window.setTimeout(() => setPhase("done"), finish);
                });
            });
        });
    }, [inView, tileSize, startMs, spreadMs]);

    if (phase === "done") return null;

    return (
        <div
            ref={ref}
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 motion-reduce:hidden", className)}
            style={
                grid
                    ? {
                          display: "grid",
                          gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
                      }
                    : { background: cover }
            }
        >
            {grid?.delays.map((delay, cell) => (
                <span
                    key={cell}
                    style={{
                        background: cover,
                        boxShadow: `0 0 0 0.5px ${cover}`,
                        opacity: phase === "revealing" ? 0 : 1,
                        transition:
                            phase === "revealing"
                                ? `opacity ${TILE_VANISH_MS}ms ${TILE_EASE} ${delay}ms`
                                : "none",
                    }}
                />
            ))}
        </div>
    );
}
