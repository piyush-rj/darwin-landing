"use client";

import { useEffect, useRef, useState } from "react";

export const PAINTING_SRC = "/images/plates/heart-of-the-andes.webp";
const CELL_SIZE = 5;
const ROW_HEIGHT = 4.5;
const DOT_RADIUS = 2.15;
export const FOCUS_Y = 0.45;
const GAP_FILTER = "brightness(0.78) saturate(1.1)";

export type Rect = { x: number; y: number; width: number; height: number };

function createCanvas(width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

export function coverRect(image: HTMLImageElement, width: number, height: number): Rect {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const coverWidth = image.naturalWidth * scale;
    const coverHeight = image.naturalHeight * scale;
    return {
        x: (width - coverWidth) / 2,
        y: (height - coverHeight) * FOCUS_Y,
        width: coverWidth,
        height: coverHeight,
    };
}

function lift(channel: number) {
    return Math.min(255, Math.round(channel * 1.06 + 6));
}

function dotTile(cell: number, row: number, radius: number) {
    const tile = createCanvas(cell, row * 2);
    const context = tile.getContext("2d");
    if (!context) return tile;
    context.fillStyle = "white";
    const centers = [
        [cell / 2, row / 2],
        [0, row * 1.5],
        [cell, row * 1.5],
    ];
    for (const [x, y] of centers) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }
    return tile;
}

function sampleCells(image: HTMLImageElement, cover: Rect, columns: number, rows: number) {
    const sampler = createCanvas(columns, rows);
    const context = sampler.getContext("2d", { willReadFrequently: true });
    if (!context) return sampler;
    context.drawImage(image, cover.x, cover.y, cover.width, cover.height);
    const cells = context.getImageData(0, 0, columns, rows);
    for (let index = 0; index < cells.data.length; index += 4) {
        cells.data[index] = lift(cells.data[index]);
        cells.data[index + 1] = lift(cells.data[index + 1]);
        cells.data[index + 2] = lift(cells.data[index + 2]);
    }
    context.putImageData(cells, 0, 0);
    return sampler;
}

function paint(canvas: HTMLCanvasElement, image: HTMLImageElement) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * pixelRatio);
    const height = Math.round(canvas.clientHeight * pixelRatio);
    const context = canvas.getContext("2d");
    if (!width || !height || !context) return;
    canvas.width = width;
    canvas.height = height;

    const cell = Math.round(CELL_SIZE * pixelRatio);
    const row = Math.round(ROW_HEIGHT * pixelRatio);
    const columns = Math.ceil(width / cell) + 1;
    const rows = Math.ceil(height / row) + 1;
    const cover = coverRect(image, width, height);
    const sampler = sampleCells(
        image,
        {
            x: cover.x / cell,
            y: cover.y / row,
            width: cover.width / cell,
            height: cover.height / row,
        },
        columns,
        rows,
    );

    context.filter = GAP_FILTER;
    context.drawImage(sampler, 0, 0, columns * cell, rows * row);
    context.filter = "none";

    const dots = createCanvas(width, height);
    const dotsContext = dots.getContext("2d");
    const pattern = dotsContext?.createPattern(
        dotTile(cell, row, DOT_RADIUS * pixelRatio),
        "repeat",
    );
    if (!dotsContext || !pattern) return;
    dotsContext.fillStyle = pattern;
    dotsContext.fillRect(0, 0, width, height);
    dotsContext.globalCompositeOperation = "source-in";
    dotsContext.drawImage(sampler, 0, 0, columns * cell, rows * row);
    context.drawImage(dots, 0, 0);
}

export default function MosaicPainting() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [painted, setPainted] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const image = new Image();
        image.src = PAINTING_SRC;
        let frame = 0;
        let observer: ResizeObserver | null = null;
        let cancelled = false;
        let paintedSize = "";

        const repaint = () => {
            const size = `${canvas.clientWidth}x${canvas.clientHeight}`;
            if (size === paintedSize) return;
            paintedSize = size;
            paint(canvas, image);
        };

        image.decode().then(() => {
            if (cancelled) return;
            repaint();
            setPainted(true);
            observer = new ResizeObserver(() => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(repaint);
            });
            observer.observe(canvas);
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
            observer?.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            role="img"
            aria-label="The Heart of the Andes by Frederic Edwin Church, 1859, set in fine beadwork"
            className={`size-full transition-opacity duration-700 ${painted ? "opacity-100" : "opacity-0"}`}
        />
    );
}
