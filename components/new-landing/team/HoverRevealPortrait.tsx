"use client";

import { useReducedMotion } from "motion/react";
import type { StaticImageData } from "next/image";
import { type PointerEvent, type ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import FounderPortrait from "./FounderPortrait";
import { type CaptionColors, captionFont, paintCaption } from "./paintCaption";
import type { PortraitFraming } from "./teamChapters";

const BLOCK_PX = 18;
const SPREAD_MS = 260;
const JITTER_MS = 60;
const POP_MS = 160;
const START_SCALE = 0.35;

const easeOutBack = (share: number) => {
    const overshoot = 1.7;
    const shifted = share - 1;
    return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
};

function jitter(x: number, y: number) {
    const mixed = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return mixed - Math.floor(mixed);
}

type Wave = { target: 0 | 1; origin: [number, number]; startedAt: number };

type Tiles = {
    columns: number;
    rows: number;
    tileWidth: number;
    tileHeight: number;
    picture: HTMLCanvasElement;
};

function resolveColor(element: HTMLElement, color: string) {
    element.style.color = color;
    const resolved = getComputedStyle(element).color;
    element.style.color = "";
    return resolved;
}

function resolveCaptionColors(element: HTMLElement, tone: string): CaptionColors {
    const black = (share: number) =>
        resolveColor(element, `color-mix(in srgb, var(--color-black) ${share}%, transparent)`);
    return {
        shadeBottom: black(80),
        shadeMiddle: black(40),
        shadeTop: black(0),
        box: black(55),
        text: resolveColor(element, "var(--color-white)"),
        accent: resolveColor(element, `color-mix(in oklab, ${tone} 70%, var(--color-white))`),
    };
}

function coverInto(
    source: HTMLImageElement,
    width: number,
    height: number,
    framing: PortraitFraming = { zoom: 1, anchorY: 0.5 },
) {
    const picture = document.createElement("canvas");
    picture.width = Math.round(width);
    picture.height = Math.round(height);
    const scale = Math.max(width / source.naturalWidth, height / source.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const context = picture.getContext("2d")!;
    context.imageSmoothingQuality = "high";
    const anchorY = picture.height * framing.anchorY;
    context.translate(picture.width / 2, anchorY);
    context.scale(framing.zoom, framing.zoom);
    context.translate(-picture.width / 2, -anchorY);
    context.drawImage(
        source,
        (source.naturalWidth - sourceWidth) / 2,
        (source.naturalHeight - sourceHeight) / 2,
        sourceWidth,
        sourceHeight,
        0,
        0,
        picture.width,
        picture.height,
    );
    context.resetTransform();
    return picture;
}

export default function HoverRevealPortrait({
    name,
    image,
    reveal,
    sizes,
    framing,
    captionLines,
    captionTone,
    className,
    children,
}: {
    name: string;
    image: StaticImageData;
    reveal: StaticImageData;
    sizes: string;
    framing?: PortraitFraming;
    captionLines?: string[];
    captionTone?: string;
    className?: string;
    children?: ReactNode;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const waveRef = useRef<Wave>({ target: 0, origin: [0.5, 0.5], startedAt: 0 });
    const wakeRef = useRef<() => void>(() => {});
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const host = hostRef.current!;
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        const source = new window.Image();
        source.src = reveal.src;
        let tiles: Tiles | null = null;
        let shown = new Float32Array(0);
        let starts = new Float32Array(0);
        let plannedWave: Wave | null = null;
        let frame = 0;
        let lastTime = 0;
        let disposed = false;

        const planWave = () => {
            if (!tiles) return;
            const wave = waveRef.current;
            const originX = wave.origin[0] * tiles.columns;
            const originY = wave.origin[1] * tiles.rows;
            const farthest = Math.max(
                Math.hypot(originX, originY),
                Math.hypot(tiles.columns - originX, originY),
                Math.hypot(originX, tiles.rows - originY),
                Math.hypot(tiles.columns - originX, tiles.rows - originY),
            );
            for (let row = 0; row < tiles.rows; row++) {
                for (let column = 0; column < tiles.columns; column++) {
                    const reach =
                        Math.hypot(column + 0.5 - originX, row + 0.5 - originY) / farthest;
                    const order = wave.target === 1 ? reach : 1 - reach;
                    starts[row * tiles.columns + column] =
                        wave.startedAt + order * SPREAD_MS + jitter(column, row) * JITTER_MS;
                }
            }
            plannedWave = wave;
        };

        const draw = (now: number) => {
            frame = 0;
            if (!tiles || disposed) return;
            if (plannedWave !== waveRef.current) planWave();
            const step = lastTime ? now - lastTime : 16;
            lastTime = now;
            const target = waveRef.current.target;
            let moving = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (let index = 0; index < shown.length; index++) {
                if (reduceMotion) shown[index] = target;
                else if (now >= starts[index] && shown[index] !== target) {
                    const change = step / POP_MS;
                    shown[index] =
                        target === 1
                            ? Math.min(1, shown[index] + change)
                            : Math.max(0, shown[index] - change);
                }
                if (shown[index] !== target) moving = true;
                const value = shown[index];
                if (value <= 0) continue;
                const x = (index % tiles.columns) * tiles.tileWidth;
                const y = Math.floor(index / tiles.columns) * tiles.tileHeight;
                const grow = target === 1 ? easeOutBack(value) : value;
                const scale = START_SCALE + (1 - START_SCALE) * grow;
                const width = tiles.tileWidth * scale;
                const height = tiles.tileHeight * scale;
                context.globalAlpha = Math.min(1, value * 2.5);
                context.drawImage(
                    tiles.picture,
                    Math.floor(x),
                    Math.floor(y),
                    Math.ceil(tiles.tileWidth),
                    Math.ceil(tiles.tileHeight),
                    Math.round(x + (tiles.tileWidth - width) / 2),
                    Math.round(y + (tiles.tileHeight - height) / 2),
                    Math.ceil(width),
                    Math.ceil(height),
                );
            }
            context.globalAlpha = 1;
            if (moving) frame = requestAnimationFrame(draw);
            else lastTime = 0;
        };

        const wake = () => {
            if (!frame) frame = requestAnimationFrame(draw);
        };
        wakeRef.current = wake;

        const build = () => {
            if (!source.complete || !source.naturalWidth) return;
            const ratio = window.devicePixelRatio || 1;
            const width = host.clientWidth * ratio;
            const height = host.clientHeight * ratio;
            if (!width || !height) return;
            canvas.width = Math.round(width);
            canvas.height = Math.round(height);
            const columns = Math.max(1, Math.round(width / (BLOCK_PX * ratio)));
            const rows = Math.max(1, Math.round(height / (BLOCK_PX * ratio)));
            const picture = coverInto(source, width, height, framing);
            if (captionLines?.length) {
                paintCaption(
                    picture,
                    captionLines,
                    captionFont(getComputedStyle(canvas).fontFamily, ratio),
                    resolveCaptionColors(canvas, captionTone ?? "var(--color-white)"),
                    ratio,
                );
            }
            tiles = {
                columns,
                rows,
                tileWidth: width / columns,
                tileHeight: height / rows,
                picture,
            };
            shown = new Float32Array(columns * rows).fill(waveRef.current.target);
            starts = new Float32Array(columns * rows);
            plannedWave = null;
            wake();
        };

        const captionFontReady = captionLines?.length
            ? document.fonts.load(captionFont(getComputedStyle(canvas).fontFamily, 1))
            : Promise.resolve();
        Promise.all([source.decode(), captionFontReady]).then(build, build);
        const observer = new ResizeObserver(build);
        observer.observe(host);
        return () => {
            disposed = true;
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [reveal.src, reduceMotion, captionLines, captionTone, framing]);

    const startWave = (event: PointerEvent<HTMLDivElement>, target: 0 | 1) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        waveRef.current = {
            target,
            origin: [
                (event.clientX - bounds.left) / bounds.width,
                (event.clientY - bounds.top) / bounds.height,
            ],
            startedAt: performance.now(),
        };
        wakeRef.current();
    };

    return (
        <div
            ref={hostRef}
            onPointerEnter={(event) => startWave(event, 1)}
            onPointerLeave={(event) => startWave(event, 0)}
            className={cn("group/portrait relative overflow-hidden", className)}
        >
            <FounderPortrait
                name={name}
                image={image}
                sizes={sizes}
                framing={framing}
                className="absolute inset-0"
            />
            <canvas
                ref={canvasRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full font-pixel"
            />
            {children}
        </div>
    );
}
