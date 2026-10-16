"use client";

import { useInView, useReducedMotion } from "motion/react";
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { easeOutCubic, planTileFlood } from "@/lib/tileFlood";
import { cn } from "@/lib/utils";

const COLUMNS = 12;
const ROWS = 8;
const STRENGTHS = [16, 22, 30, 42, 58, 76];

const STEP_MS = 38;
const JITTER_MS = 50;
const TILE_MS = 360;
const CARD_DELAY_MS = 160;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function seedFrom(tone: string) {
    return [...tone].reduce((sum, character) => sum * 31 + character.charCodeAt(0), 7);
}

const floodPlans = new Map<string, number[]>();

function floodFor(tone: string) {
    let plan = floodPlans.get(tone);
    if (!plan) {
        plan = planFlood(seedFrom(tone));
        floodPlans.set(tone, plan);
    }
    return plan;
}

function planFlood(seed: number) {
    return planTileFlood(COLUMNS, ROWS, seed, { stepMs: STEP_MS, jitterMs: JITTER_MS });
}

function strengthAt(cell: number) {
    const column = cell % COLUMNS;
    const row = Math.floor(cell / COLUMNS);
    const hash = (column * 73 + row * 151 + column * row * 17) % 97;
    return STRENGTHS[hash % STRENGTHS.length];
}

function ToneTiles({ tone, shown, animate }: { tone: string; shown: boolean; animate: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        let toneColor = "";
        let snow = "";
        const readColors = () => {
            const styles = getComputedStyle(canvas);
            toneColor = styles.getPropertyValue("--tone").trim();
            snow = styles.getPropertyValue("--color-snow").trim() || "#ffffff";
        };
        readColors();
        const delays = floodFor(tone);
        let width = 0;
        let height = 0;
        let frame = 0;
        let startedAt = 0;

        const draw = (elapsed: number) => {
            context.clearRect(0, 0, width, height);
            const tileWidth = width / COLUMNS;
            const tileHeight = height / ROWS;
            delays.forEach((delay, cell) => {
                const reveal = easeOutCubic(Math.min(1, Math.max(0, (elapsed - delay) / TILE_MS)));
                if (reveal <= 0) return;
                const scale = 0.8 + 0.2 * reveal;
                const x = (cell % COLUMNS) * tileWidth + (tileWidth * (1 - scale)) / 2;
                const y = Math.floor(cell / COLUMNS) * tileHeight + (tileHeight * (1 - scale)) / 2;
                context.globalAlpha = reveal;
                context.fillStyle = snow;
                context.fillRect(x, y, tileWidth * scale, tileHeight * scale);
                context.globalAlpha = reveal * (strengthAt(cell) / 100);
                context.fillStyle = toneColor;
                context.fillRect(x, y, tileWidth * scale, tileHeight * scale);
            });
            context.globalAlpha = 0.25;
            context.fillStyle = snow;
            for (let column = 1; column <= COLUMNS; column++) {
                context.fillRect(Math.round(column * tileWidth) - 1, 0, 1, height);
            }
            for (let row = 1; row <= ROWS; row++) {
                context.fillRect(0, Math.round(row * tileHeight) - 1, width, 1);
            }
            context.globalAlpha = 1;
        };

        const finishedAt = Math.max(...delays) + TILE_MS;
        const tick = (now: number) => {
            if (!startedAt) startedAt = now;
            const elapsed = now - startedAt;
            draw(elapsed);
            if (elapsed < finishedAt) frame = requestAnimationFrame(tick);
        };

        const settled = () =>
            shown && (!animate || (startedAt > 0 && performance.now() - startedAt >= finishedAt));

        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            if (settled()) draw(finishedAt);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        resize();

        const themeObserver = new MutationObserver(() => {
            readColors();
            if (settled()) draw(finishedAt);
        });
        const themeRoot = canvas.closest("[data-landing-root]") ?? document.documentElement;
        themeObserver.observe(themeRoot, { attributes: true, attributeFilter: ["class"] });

        if (shown) {
            if (animate) frame = requestAnimationFrame(tick);
            else draw(finishedAt);
        }

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            themeObserver.disconnect();
        };
    }, [tone, shown, animate]);

    return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />;
}

export default function ToneMosaic({
    tone,
    className,
    children,
}: {
    tone: string;
    className: string;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const reduceMotion = useReducedMotion();
    const shown = inView || !!reduceMotion;
    const cardDelayMs = Math.max(...floodFor(tone)) * 0.5 + CARD_DELAY_MS;

    return (
        <div
            ref={ref}
            className={cn("relative w-full overflow-hidden", className)}
            style={{ "--tone": tone } as CSSProperties}
        >
            <ToneTiles tone={tone} shown={shown} animate={!reduceMotion} />
            <div
                className="absolute inset-0"
                style={{
                    opacity: shown ? 1 : 0,
                    transform: shown ? "translateY(0)" : "translateY(12px)",
                    transition: reduceMotion
                        ? "none"
                        : `opacity 420ms ${EASE} ${cardDelayMs}ms, transform 560ms ${EASE} ${cardDelayMs}ms`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
