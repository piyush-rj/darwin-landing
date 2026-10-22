"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { seededRandom } from "@/lib/seededRandom";
import { cn } from "@/lib/utils";

const LEVELS = [0.08, 0.15, 0.22, 0.3, 0.38, 0.48];
const SWAP_SHARE = 0.14;
const MOVE_MS = 900;

type Rgb = [number, number, number];

type Board = {
    columns: number;
    rows: number;
    levels: number[];
    fromCell: number[];
    toCell: number[];
};

function hexToRgb(hex: string): Rgb {
    const value = Number.parseInt(hex.replace("#", ""), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const easeInOut = (progress: number) =>
    progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

function shuffled<T>(items: T[]) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index--) {
        const pick = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[pick]] = [copy[pick], copy[index]];
    }
    return copy;
}

function buildBoard(columns: number, rows: number, levels: number[]): Board {
    const count = columns * rows;
    const random = seededRandom(columns * 31 + rows);
    const cells = Array.from({ length: count }, (_, cell) => cell);
    return {
        columns,
        rows,
        levels: cells.map(() => levels[Math.floor(random() * levels.length)]),
        fromCell: cells.slice(),
        toCell: cells.slice(),
    };
}

function neighbours(cell: number, columns: number, rows: number) {
    const column = cell % columns;
    const row = Math.floor(cell / columns);
    return [
        column > 0 ? cell - 1 : -1,
        column < columns - 1 ? cell + 1 : -1,
        row > 0 ? cell - columns : -1,
        row < rows - 1 ? cell + columns : -1,
    ].filter((neighbour) => neighbour >= 0);
}

function planSwaps(board: Board) {
    const tileAtCell: number[] = [];
    board.toCell.forEach((cell, tile) => {
        tileAtCell[cell] = tile;
    });
    board.fromCell = board.toCell.slice();
    const busy = new Set<number>();
    const wanted = Math.round(board.levels.length * SWAP_SHARE);
    let swaps = 0;
    for (const tile of shuffled(board.levels.map((_, index) => index))) {
        if (swaps >= wanted) break;
        const cell = board.fromCell[tile];
        if (busy.has(cell)) continue;
        const target = shuffled(neighbours(cell, board.columns, board.rows)).find(
            (neighbour) =>
                !busy.has(neighbour) && board.levels[tileAtCell[neighbour]] !== board.levels[tile],
        );
        if (target === undefined) continue;
        const other = tileAtCell[target];
        board.toCell[tile] = target;
        board.toCell[other] = cell;
        busy.add(cell);
        busy.add(target);
        swaps++;
    }
}

export default function SwapMosaic({
    tone,
    tileSize = 88,
    levels = LEVELS,
    className,
}: {
    tone: string;
    tileSize?: number;
    levels?: number[];
    className?: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduceMotion = useReducedMotion();
    const change = useRef<(next: Rgb) => void>(() => {});
    const latestTone = useRef(hexToRgb(tone));

    useEffect(() => {
        latestTone.current = hexToRgb(tone);
        change.current(latestTone.current);
    }, [tone]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        const snow = getComputedStyle(canvas).getPropertyValue("--color-snow").trim() || "#ffffff";
        context.fillStyle = snow;
        const paper = hexToRgb(String(context.fillStyle));
        let width = 0;
        let height = 0;
        let board = buildBoard(1, 1, levels);
        let fromColor = latestTone.current;
        let toColor = fromColor;
        let startedAt = 0;
        let frame = 0;

        const draw = (progress: number) => {
            const eased = easeInOut(progress);
            const tone = fromColor.map((channel, index) =>
                Math.round(channel + (toColor[index] - channel) * eased),
            );
            const fill = (level: number) =>
                `rgb(${tone.map((channel, index) => Math.round(paper[index] + (channel - paper[index]) * level)).join(",")})`;
            const cellBox = (cell: number) =>
                [
                    (cell % board.columns) * tileSize,
                    Math.floor(cell / board.columns) * tileSize,
                ] as const;
            const moving = board.levels
                .map((_, tile) => tile)
                .filter((tile) => board.fromCell[tile] !== board.toCell[tile]);
            board.levels.forEach((level, tile) => {
                if (board.fromCell[tile] !== board.toCell[tile]) return;
                const [x, y] = cellBox(board.toCell[tile]);
                context.fillStyle = fill(level);
                context.fillRect(x, y, tileSize, tileSize);
            });
            moving.forEach((tile) => {
                const partner = moving.find(
                    (other) => board.toCell[other] === board.fromCell[tile],
                );
                const [x, y] = cellBox(board.fromCell[tile]);
                context.fillStyle = fill(
                    Math.min(board.levels[tile], partner === undefined ? 1 : board.levels[partner]),
                );
                context.fillRect(x, y, tileSize, tileSize);
            });
            moving.forEach((tile) => {
                const [fromX, fromY] = cellBox(board.fromCell[tile]);
                const [toX, toY] = cellBox(board.toCell[tile]);
                context.fillStyle = fill(board.levels[tile]);
                context.fillRect(
                    fromX + (toX - fromX) * eased,
                    fromY + (toY - fromY) * eased,
                    tileSize,
                    tileSize,
                );
            });
            context.fillStyle = snow;
            context.globalAlpha = 0.4;
            for (let column = 1; column < board.columns; column++) {
                context.fillRect(column * tileSize - 1, 0, 1, height);
            }
            for (let row = 1; row < board.rows; row++) {
                context.fillRect(0, row * tileSize - 1, width, 1);
            }
            context.globalAlpha = 1;
        };

        const tick = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / MOVE_MS);
            draw(progress);
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
                return;
            }
            board.fromCell = board.toCell.slice();
            fromColor = toColor;
        };

        change.current = (next) => {
            cancelAnimationFrame(frame);
            fromColor = toColor;
            toColor = next;
            if (reduceMotion) {
                fromColor = next;
                draw(1);
                return;
            }
            planSwaps(board);
            startedAt = performance.now();
            frame = requestAnimationFrame(tick);
        };

        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            board = buildBoard(Math.ceil(width / tileSize), Math.ceil(height / tileSize), levels);
            fromColor = toColor;
            draw(1);
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            change.current = () => {};
        };
    }, [reduceMotion, tileSize, levels]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 size-full", className)}
        />
    );
}
