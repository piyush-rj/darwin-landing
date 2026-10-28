"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { seededRandom } from "@/lib/seededRandom";

const SHADE_WEIGHTS = [0.56, 0.24, 0.12, 0.08];
const LIGHT_AND_DARK_CLASSES = ["bg-white", "bg-black"];

const REVEAL_MS = 460;
const REVEAL_STEP_MS = 26;
const FLICKER_EVERY_MS = 110;
const DOT_SHARE = 0.86;

const REPEL_RADIUS = 160;
const REPEL_PUSH = 42;
const SPRING_STIFFNESS = 170;
const SPRING_DAMPING = 15;

const REST_DEPTH = 3;
const LIFT_DEPTH = 7;
const BEVEL_SHARE = 0.14;
const SIDE_SHADE = 0.3;
const SHADOW_SHADE = 0.16;
const HIGHLIGHT = 0.38;
const TRAIL_DECAY = 0.93;
const TRAIL_FILL = 0.9;
const TRAIL_EDGE = 0.6;
const WAVE_MS_PER_PX = 0.7;

type Cell = {
    x: number;
    y: number;
    round: boolean;
    shade: number;
    delay: number;
    offsetX: number;
    offsetY: number;
    velocityX: number;
    velocityY: number;
    lift: number;
};

function pickShade(random: () => number) {
    let roll = random();
    for (let shade = 0; shade < SHADE_WEIGHTS.length; shade++) {
        roll -= SHADE_WEIGHTS[shade];
        if (roll <= 0) return shade;
    }
    return 0;
}

function buildDunes(width: number, height: number, size: number) {
    const random = seededRandom(20261028);
    const cells: Cell[] = [];
    const columns = Math.ceil(width / size);
    const bottomRowTop = (Math.ceil(height / size) - 1) * size;
    const middle = Math.floor(columns * 0.5);
    const narrow = width < 640;
    const peak = Math.floor((height * (narrow ? 0.38 : 0.66)) / size);

    for (let column = 0; column < columns; column++) {
        const left = column < middle;
        const share = left ? 1 - column / middle : (column - middle) / (columns - middle);
        const curve = share ** (left ? 1.25 : 1.6) * peak;
        const jag = Math.round((random() - 0.5) * 3);
        const rows = Math.max(1 + Math.round(random()), Math.round(curve) + jag);
        const cornerX = left ? 0 : columns - 1;

        const add = (row: number) =>
            cells.push({
                x: column * size,
                y: bottomRowTop - row * size,
                round: !left,
                shade: pickShade(random),
                delay: (Math.abs(column - cornerX) * 0.7 + row) * REVEAL_STEP_MS + random() * 120,
                offsetX: 0,
                offsetY: 0,
                velocityX: 0,
                velocityY: 0,
                lift: 0,
            });

        for (let row = 0; row < rows; row++) add(row);
        if (random() < 0.28) add(rows + 1 + Math.floor(random() * 3));
    }
    return cells;
}

export default function PixelDunes({
    shades: shadeClasses,
    onSecret,
    className,
}: {
    shades: string[];
    onSecret?: () => void;
    className?: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const recolorRef = useRef<() => void>(null);
    const appliedShadesRef = useRef(shadeClasses.join());
    const onSecretRef = useRef(onSecret);

    useEffect(() => {
        onSecretRef.current = onSecret;
    }, [onSecret]);

    useEffect(() => {
        const key = shadeClasses.join();
        if (key === appliedShadesRef.current) return;
        appliedShadesRef.current = key;
        recolorRef.current?.();
    }, [shadeClasses]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const stage = canvas.parentElement!;
        const context = canvas.getContext("2d")!;
        let shades: string[] = [];
        let previousShades: string[] = [];
        let switchedAt = -Infinity;
        let light = "";
        let dark = "";
        const readColors = () => {
            const swatches = Array.from(
                paletteRef.current!.children,
                (swatch) => getComputedStyle(swatch).backgroundColor,
            );
            const shadeCount = swatches.length - LIGHT_AND_DARK_CLASSES.length;
            shades = swatches.slice(0, shadeCount);
            [light, dark] = swatches.slice(shadeCount);
        };
        const random = seededRandom(7);
        let cells: Cell[] = [];
        let size = 0;
        let width = 0;
        let height = 0;
        let startedAt = 0;
        let lastFrame = 0;
        let lastFlicker = 0;
        let frame = 0;
        let visible = true;
        let pointer: { x: number; y: number } | null = null;
        const trail = new Map<string, number>();

        const outline = (left: number, top: number, span: number, round: boolean) => {
            context.beginPath();
            if (round) context.arc(left + span / 2, top + span / 2, span / 2, 0, Math.PI * 2);
            else context.rect(left, top, span, span);
        };

        const tint = (color: string, alpha: number, opacity: number) => {
            context.globalAlpha = alpha * opacity;
            context.fillStyle = color;
            context.fill();
        };

        const paletteFor = (cell: Cell, now: number) =>
            now - switchedAt < Math.hypot(cell.x, height - cell.y) * WAVE_MS_PER_PX
                ? previousShades
                : shades;

        const paint = (cell: Cell, now: number, elapsed: number, layer: "side" | "face") => {
            const reveal = Math.min(1, Math.max(0, (elapsed - cell.delay) / REVEAL_MS));
            if (reveal <= 0) return;
            const opacity = 1 - (1 - reveal) ** 3;
            const span = size * (0.35 + 0.65 * opacity) * (cell.round ? DOT_SHARE : 1);
            const left = cell.x + cell.offsetX + (size - span) / 2 - cell.lift * 2;
            const top = cell.y + cell.offsetY + (size - span) / 2 - cell.lift * 2;
            const base = paletteFor(cell, now)[cell.shade];

            if (layer === "side") {
                const depth = REST_DEPTH + cell.lift * LIFT_DEPTH;
                outline(left + depth, top + depth, span, cell.round);
                tint(base, 1, opacity);
                tint(dark, SIDE_SHADE, opacity);
                return;
            }

            outline(left, top, span, cell.round);
            tint(base, 1, opacity);
            if (cell.round) {
                const radius = span / 2;
                context.beginPath();
                context.arc(left + radius * 0.7, top + radius * 0.7, radius * 0.34, 0, Math.PI * 2);
                tint(light, HIGHLIGHT, opacity);
                return;
            }
            const bevel = Math.max(2, span * BEVEL_SHARE);
            context.beginPath();
            context.rect(left, top, span, bevel);
            context.rect(left, top + bevel, bevel, span - bevel);
            tint(light, HIGHLIGHT, opacity);
            context.beginPath();
            context.rect(left + bevel, top + span - bevel, span - bevel, bevel);
            context.rect(left + span - bevel, top + bevel, bevel, span - bevel * 2);
            tint(dark, SHADOW_SHADE, opacity);
        };

        const paintTrail = () => {
            for (const [key, strength] of trail) {
                const [column, row] = key.split(":").map(Number);
                const left = column * size;
                const top = row * size;
                context.beginPath();
                context.rect(left + 0.5, top + 0.5, size - 1, size - 1);
                tint(shades[3], strength * TRAIL_FILL, 1);
                context.globalAlpha = strength * TRAIL_EDGE;
                context.strokeStyle = shades[0];
                context.lineWidth = 1;
                context.stroke();
            }
        };

        const fadeTrail = () => {
            for (const [key, strength] of trail) {
                const next = strength * TRAIL_DECAY;
                if (next < 0.02) trail.delete(key);
                else trail.set(key, next);
            }
        };

        const draw = (now: number) => {
            context.clearRect(0, 0, width, height);
            paintTrail();
            const elapsed = reduceMotion ? Infinity : now - startedAt;
            const resting = cells.filter((cell) => cell.lift < 0.04);
            const lifted = cells
                .filter((cell) => cell.lift >= 0.04)
                .sort((a, b) => a.lift - b.lift);
            for (const cell of resting) paint(cell, now, elapsed, "side");
            for (const cell of resting) paint(cell, now, elapsed, "face");
            for (const cell of lifted) {
                paint(cell, now, elapsed, "side");
                paint(cell, now, elapsed, "face");
            }
            context.globalAlpha = 1;
        };

        const settle = (dt: number) => {
            for (const cell of cells) {
                let targetX = 0;
                let targetY = 0;
                if (pointer) {
                    const deltaX = cell.x + size / 2 - pointer.x;
                    const deltaY = cell.y + size / 2 - pointer.y;
                    const distance = Math.hypot(deltaX, deltaY) || 1;
                    if (distance < REPEL_RADIUS) {
                        const push = (1 - distance / REPEL_RADIUS) ** 2 * REPEL_PUSH;
                        targetX = (deltaX / distance) * push;
                        targetY = (deltaY / distance) * push;
                    }
                }
                cell.velocityX +=
                    ((targetX - cell.offsetX) * SPRING_STIFFNESS -
                        cell.velocityX * SPRING_DAMPING) *
                    dt;
                cell.velocityY +=
                    ((targetY - cell.offsetY) * SPRING_STIFFNESS -
                        cell.velocityY * SPRING_DAMPING) *
                    dt;
                cell.offsetX += cell.velocityX * dt;
                cell.offsetY += cell.velocityY * dt;
                cell.lift = Math.min(1, Math.hypot(cell.offsetX, cell.offsetY) / REPEL_PUSH);
            }
        };

        const tick = (now: number) => {
            const dt = Math.min(0.032, (now - (lastFrame || now)) / 1000);
            lastFrame = now;
            if (now - lastFlicker > FLICKER_EVERY_MS && cells.length) {
                lastFlicker = now;
                for (let flip = 0; flip < 3; flip++) {
                    cells[Math.floor(random() * cells.length)].shade = pickShade(random);
                }
            }
            settle(dt);
            fadeTrail();
            draw(now);
            if (visible) frame = requestAnimationFrame(tick);
        };

        const resize = () => {
            readColors();
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            const preferredSize = width < 640 ? 18 : 30;
            size = height / Math.max(1, Math.round(height / preferredSize));
            stage.style.setProperty("--cell", `${size}px`);
            cells = buildDunes(width, height, size);
            draw(performance.now());
        };

        const onMove = (event: PointerEvent) => {
            const box = canvas.getBoundingClientRect();
            pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
            trail.set(`${Math.floor(pointer.x / size)}:${Math.floor(pointer.y / size)}`, 1);
        };
        const onLeave = () => {
            pointer = null;
        };

        const inSecretCell = (event: MouseEvent) => {
            const box = canvas.getBoundingClientRect();
            const bottomRowTop = (Math.ceil(height / size) - 1) * size;
            return event.clientX - box.left < size && event.clientY - box.top >= bottomRowTop;
        };
        const onPress = (event: MouseEvent) => {
            if (event.detail > 1 && inSecretCell(event)) event.preventDefault();
        };
        const onClick = (event: MouseEvent) => {
            if (event.detail === 3 && inSecretCell(event)) onSecretRef.current?.();
        };

        recolorRef.current = () => {
            previousShades = shades;
            readColors();
            if (!reduceMotion) switchedAt = performance.now();
            draw(performance.now());
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        resize();
        stage.addEventListener("mousedown", onPress);
        stage.addEventListener("click", onClick);
        const stopSecret = () => {
            stage.removeEventListener("mousedown", onPress);
            stage.removeEventListener("click", onClick);
        };

        if (reduceMotion) {
            return () => {
                resizeObserver.disconnect();
                stopSecret();
            };
        }

        startedAt = performance.now();
        const visibility = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            cancelAnimationFrame(frame);
            lastFrame = 0;
            if (visible) frame = requestAnimationFrame(tick);
        });
        visibility.observe(canvas);
        stage.addEventListener("pointermove", onMove);
        stage.addEventListener("pointerleave", onLeave);

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            stopSecret();
            visibility.disconnect();
            stage.removeEventListener("pointermove", onMove);
            stage.removeEventListener("pointerleave", onLeave);
        };
    }, [reduceMotion]);

    return (
        <>
            <div ref={paletteRef} hidden>
                {[...shadeClasses, ...LIGHT_AND_DARK_CLASSES].map((shade) => (
                    <span key={shade} className={shade} />
                ))}
            </div>
            <canvas
                ref={canvasRef}
                aria-hidden
                className={className ?? "pointer-events-none absolute inset-0 size-full"}
            />
        </>
    );
}
