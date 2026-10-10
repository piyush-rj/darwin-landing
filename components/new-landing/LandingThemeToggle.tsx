"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useSyncExternalStore } from "react";

import { LANDING_DARK_CLASS, type LandingTheme } from "@/lib/landingTheme";
import { cn } from "@/lib/utils";
import { useLandingThemeStore } from "@/store/landing/useLandingThemeStore";

const PIXEL = 1;
const GRID_WIDTH = 16;
const SKY_ROWS = 11;
const GRID_HEIGHT = 16;
const WATER: [x: number, y: number, length: number][] = [
    [1, 12, 4],
    [6, 12, 4],
    [11, 12, 4],
    [3, 14, 3],
    [9, 14, 4],
];

type Cell = [x: number, y: number];

function bitmap(rows: string[], offsetY: number): Cell[] {
    return rows.flatMap((row, y) =>
        [...row].flatMap((pixel, x) => (pixel === "#" ? [[x, y + offsetY] as Cell] : [])),
    );
}

const SUN = bitmap(
    [
        "......####......",
        ".....######.....",
        "....########....",
        "....########....",
        "....########....",
        "....########....",
        ".....######.....",
        "......####......",
    ],
    2,
);

const MOON = bitmap(
    [
        "......##....#...",
        ".....##.........",
        "....###.........",
        "....###.......#.",
        "....####........",
        "....#####.......",
        ".....######.....",
        "......####......",
    ],
    2,
);

const BODIES: Record<LandingTheme, Cell[]> = { light: SUN, dark: MOON };

function subscribeToHydration(onChange: () => void) {
    return useLandingThemeStore.persist.onFinishHydration(onChange);
}

function useHasHydrated() {
    return useSyncExternalStore(
        subscribeToHydration,
        () => useLandingThemeStore.persist.hasHydrated(),
        () => false,
    );
}

function applyTheme(theme: LandingTheme) {
    const dark = theme === "dark";
    document.querySelector("[data-landing-root]")?.classList.toggle(LANDING_DARK_CLASS, dark);
    document.body.classList.toggle(LANDING_DARK_CLASS, dark);
}

function PixelBody({ cells }: { cells: Cell[] }) {
    return (
        <svg
            viewBox={`0 0 ${GRID_WIDTH} ${SKY_ROWS}`}
            shapeRendering="crispEdges"
            className="absolute inset-0 size-full fill-current"
        >
            {cells.map(([x, y]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
            ))}
        </svg>
    );
}

export default function LandingThemeToggle({ className }: { className?: string }) {
    const theme = useLandingThemeStore((state) => state.theme);
    const toggleTheme = useLandingThemeStore((state) => state.toggleTheme);
    const hydrated = useHasHydrated();

    useLayoutEffect(() => {
        useLandingThemeStore.persist.rehydrate();
        return () => document.body.classList.remove(LANDING_DARK_CLASS);
    }, []);

    useLayoutEffect(() => {
        if (hydrated) applyTheme(theme);
    }, [hydrated, theme]);

    const dark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
                "cursor-pointer transition-colors hover:bg-mist",
                dark ? "text-foreground" : "text-neutral-500",
                className,
            )}
        >
            <span
                aria-hidden
                className="relative block"
                style={{ width: GRID_WIDTH * PIXEL, height: GRID_HEIGHT * PIXEL }}
            >
                <span
                    className="absolute inset-x-0 top-0 overflow-hidden"
                    style={{ height: SKY_ROWS * PIXEL }}
                >
                    {hydrated && (
                        <AnimatePresence initial={false}>
                            <motion.span
                                key={theme}
                                initial={{ y: SKY_ROWS * PIXEL }}
                                animate={{ y: 0 }}
                                exit={{ y: SKY_ROWS * PIXEL }}
                                transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                                className="absolute inset-0"
                            >
                                <PixelBody cells={BODIES[theme]} />
                            </motion.span>
                        </AnimatePresence>
                    )}
                </span>
                <svg
                    viewBox={`0 0 ${GRID_WIDTH} ${GRID_HEIGHT}`}
                    shapeRendering="crispEdges"
                    className="absolute inset-0 size-full fill-current"
                >
                    {WATER.map(([x, y, length]) => (
                        <rect key={`${x}-${y}`} x={x} y={y} width={length} height={1} />
                    ))}
                </svg>
            </span>
        </button>
    );
}
