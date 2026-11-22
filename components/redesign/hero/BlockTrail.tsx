"use client";

import { useEffect, useRef } from "react";

import { coverRect, PAINTING_SRC, type Rect } from "./MosaicPainting";

const TILE = 48;
const LIFE_MS = 1100;
const BLOCK_PHASE = 0.18;
const RETRIGGER_PHASE = 0.35;
const NEIGHBOR_CHANCE = 0.5;
const IDLE_MS = 1600;
const NEIGHBORS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
];

type Grid = {
    width: number;
    height: number;
    columns: number;
    rows: number;
    cover: Rect;
    blocks: Uint8ClampedArray;
};

function measureGrid(canvas: HTMLCanvasElement, image: HTMLImageElement): Grid | null {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const context = canvas.getContext("2d");
    if (!width || !height || !context) return null;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const columns = Math.ceil(width / TILE);
    const rows = Math.ceil(height / TILE);
    const cover = coverRect(image, width, height);
    const sampler = document.createElement("canvas");
    sampler.width = columns;
    sampler.height = rows;
    const samplerContext = sampler.getContext("2d", { willReadFrequently: true });
    if (!samplerContext) return null;
    samplerContext.drawImage(
        image,
        cover.x / TILE,
        cover.y / TILE,
        cover.width / TILE,
        cover.height / TILE,
    );
    const blocks = samplerContext.getImageData(0, 0, columns, rows).data;
    return { width, height, columns, rows, cover, blocks };
}

function ambientPoint(grid: Grid, seconds: number) {
    return {
        x: grid.width * (0.5 + 0.42 * Math.sin(seconds * 0.47)),
        y: grid.height * (0.56 + 0.32 * Math.sin(seconds * 0.71 + 1.3)),
    };
}

export default function BlockTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const image = new Image();
        image.src = PAINTING_SRC;
        const frameColor = getComputedStyle(canvas).getPropertyValue("--color-snow").trim();
        const tiles = new Map<number, number>();
        let grid: Grid | null = null;
        let frame = 0;
        let visible = true;
        let lastPointerAt = -Infinity;
        let lastPointerTile = -1;
        let lastAmbientTile = -1;

        const tileIndex = (column: number, row: number) =>
            grid && column >= 0 && row >= 0 && column < grid.columns && row < grid.rows
                ? row * grid.columns + column
                : -1;

        const activate = (index: number, now: number) => {
            if (index < 0) return;
            const born = tiles.get(index);
            if (born !== undefined && now - born < LIFE_MS * RETRIGGER_PHASE) return;
            tiles.set(index, now);
        };

        const enterTile = (x: number, y: number, now: number, previous: number) => {
            const column = Math.floor(x / TILE);
            const row = Math.floor(y / TILE);
            const index = tileIndex(column, row);
            if (index === previous) return previous;
            activate(index, now);
            if (Math.random() < NEIGHBOR_CHANCE) {
                const [dx, dy] = NEIGHBORS[Math.floor(Math.random() * NEIGHBORS.length)];
                activate(tileIndex(column + dx, row + dy), now);
            }
            return index;
        };

        const drawTile = (index: number, progress: number) => {
            if (!grid) return;
            const column = index % grid.columns;
            const row = Math.floor(index / grid.columns);
            const x = column * TILE;
            const y = row * TILE;
            if (progress < BLOCK_PHASE) {
                const offset = index * 4;
                context.globalAlpha = 1;
                context.fillStyle = `rgb(${grid.blocks[offset]} ${grid.blocks[offset + 1]} ${grid.blocks[offset + 2]})`;
                context.fillRect(x, y, TILE, TILE);
                return;
            }
            const settle = (progress - BLOCK_PHASE) / (1 - BLOCK_PHASE);
            const alpha = 1 - settle * settle;
            const scaleX = image.naturalWidth / grid.cover.width;
            const scaleY = image.naturalHeight / grid.cover.height;
            context.globalAlpha = alpha;
            context.drawImage(
                image,
                (x - grid.cover.x) * scaleX,
                (y - grid.cover.y) * scaleY,
                TILE * scaleX,
                TILE * scaleY,
                x,
                y,
                TILE,
                TILE,
            );
            context.globalAlpha = alpha * 0.6;
            context.strokeStyle = frameColor;
            context.lineWidth = 1;
            context.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
        };

        const tick = (now: number) => {
            frame = requestAnimationFrame(tick);
            if (!grid || !visible) return;
            if (now - lastPointerAt > IDLE_MS) {
                const point = ambientPoint(grid, now / 1000);
                lastAmbientTile = enterTile(point.x, point.y, now, lastAmbientTile);
            }
            context.clearRect(0, 0, grid.width, grid.height);
            for (const [index, born] of tiles) {
                const progress = (now - born) / LIFE_MS;
                if (progress >= 1) tiles.delete(index);
                else drawTile(index, progress);
            }
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!grid) return;
            const rect = canvas.getBoundingClientRect();
            const now = performance.now();
            lastPointerAt = now;
            lastPointerTile = enterTile(
                event.clientX - rect.left,
                event.clientY - rect.top,
                now,
                lastPointerTile,
            );
        };

        const resizeObserver = new ResizeObserver(() => {
            if (!image.complete) return;
            grid = measureGrid(canvas, image);
            tiles.clear();
        });
        const visibilityObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        });

        let cancelled = false;
        image.decode().then(() => {
            if (cancelled) return;
            grid = measureGrid(canvas, image);
            resizeObserver.observe(canvas);
            visibilityObserver.observe(canvas);
            canvas.addEventListener("pointermove", handlePointerMove);
            frame = requestAnimationFrame(tick);
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            visibilityObserver.disconnect();
            canvas.removeEventListener("pointermove", handlePointerMove);
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />;
}
