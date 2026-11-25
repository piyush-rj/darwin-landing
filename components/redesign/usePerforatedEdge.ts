import { type CSSProperties, useLayoutEffect, useMemo, useRef, useState } from "react";

const WAVE_LENGTH = 15;
const STRIP_DEPTH = 14;
const STRIP_OVERHANG = 2;
const STRIP_REACH = STRIP_DEPTH - STRIP_OVERHANG;

type EdgeSize = { width: number; height: number };

export type EdgeSide = "top" | "bottom" | "left" | "right";

const ALL_SIDES: EdgeSide[] = ["top", "bottom", "left", "right"];

function round(value: number) {
    return Math.round(value * 1000) / 1000;
}

function fittedWaveLength(sideLength: number) {
    const halfOddWaves = Math.max(1, Math.round(sideLength / WAVE_LENGTH - 0.5)) + 0.5;
    return round(sideLength / halfOddWaves);
}

function outsideStrip(
    id: string,
    origin: { x: number; y: number },
    tile: { width: number; height: number },
    strip: { width: number; height: number },
    path: string,
) {
    const pattern = `<pattern id="${id}" patternUnits="userSpaceOnUse" x="${origin.x}" y="${origin.y}" width="${tile.width}" height="${tile.height}"><path d="${path}"/></pattern>`;
    const rect = `<rect x="${origin.x}" y="${origin.y}" width="${strip.width}" height="${strip.height}" fill="url(#${id})"/>`;
    return { pattern, rect };
}

function edgeMask({ width, height }: EdgeSize, sides: EdgeSide[]) {
    const across = fittedWaveLength(width);
    const down = fittedWaveLength(height);
    const horizontalTile = { width: across, height: STRIP_DEPTH };
    const verticalTile = { width: STRIP_DEPTH, height: down };
    const horizontalStrip = { width, height: STRIP_DEPTH };
    const verticalStrip = { width: STRIP_DEPTH, height };
    const stripBySide: Record<EdgeSide, ReturnType<typeof outsideStrip>> = {
        top: outsideStrip(
            "top",
            { x: 0, y: -STRIP_OVERHANG },
            horizontalTile,
            horizontalStrip,
            `M0 7 Q${across / 4} 1 ${across / 2} 7 T${across} 7 V1 H0 Z`,
        ),
        bottom: outsideStrip(
            "bottom",
            { x: 0, y: height - STRIP_REACH },
            horizontalTile,
            horizontalStrip,
            `M0 7 Q${across / 4} 13 ${across / 2} 7 T${across} 7 V13 H0 Z`,
        ),
        left: outsideStrip(
            "left",
            { x: -STRIP_OVERHANG, y: 0 },
            verticalTile,
            verticalStrip,
            `M7 0 Q1 ${down / 4} 7 ${down / 2} T7 ${down} H1 V0 Z`,
        ),
        right: outsideStrip(
            "right",
            { x: width - STRIP_REACH, y: 0 },
            verticalTile,
            verticalStrip,
            `M7 0 Q13 ${down / 4} 7 ${down / 2} T7 ${down} H13 V0 Z`,
        ),
    };
    const strips = sides.map((side) => stripBySide[side]);
    const patterns = strips.map((strip) => strip.pattern).join("");
    const cutouts = strips.map((strip) => strip.rect).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs>${patterns}<mask id="edge"><rect width="${width}" height="${height}" fill="white"/>${cutouts}</mask></defs><rect width="${width}" height="${height}" mask="url(#edge)"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / 100% 100% no-repeat`;
}

export function usePerforatedEdge<Element extends HTMLElement>(sides: EdgeSide[] = ALL_SIDES) {
    const elementRef = useRef<Element>(null);
    const [size, setSize] = useState<EdgeSize | null>(null);

    useLayoutEffect(() => {
        const element = elementRef.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            const box = entry.borderBoxSize[0];
            setSize({ width: round(box.inlineSize), height: round(box.blockSize) });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const style = useMemo<CSSProperties | undefined>(
        () => (size ? { mask: edgeMask(size, sides) } : undefined),
        [size, sides],
    );

    return [elementRef, style] as const;
}
