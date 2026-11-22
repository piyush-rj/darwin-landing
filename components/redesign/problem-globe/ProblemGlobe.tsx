"use client";

import { geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { useEffect, useRef, useState } from "react";

import { type GlobeAtlas, loadGlobeAtlas, REST_TONE } from "./globeAtlas";

export type GlobeFocus = { country: string; center: [number, number] };

type Palette = {
    graticule: string;
    outline: string;
    rim: string;
    dot: string;
    denseDot: string;
    focusDot: string;
    focusEdge: string;
};

type View = {
    center: [number, number];
    focusIndex: number;
    previousFocusIndex: number;
    blend: number;
};

const TURN_DURATION_MS = 1700;
const LIMB_BAND = 0.18;
const GLOBE_BOTTOM_GAP = 32;
const RADIANS = Math.PI / 180;
const GRATICULE = geoGraticule10();

function readPalette(): Palette {
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    return {
        graticule: token("--color-stone-300"),
        outline: token("--color-stone-400"),
        rim: token("--color-stone-400"),
        dot: token("--color-stone-500"),
        denseDot: token("--color-stone-900"),
        focusDot: token("--color-amber-500"),
        focusEdge: token("--color-amber-300"),
    };
}

function easeInOutCubic(progress: number) {
    return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

function globeFrame(width: number, height: number) {
    const radius = width < 768 ? width * 0.62 : Math.min(height * 0.42, width * 0.4);
    return { centerX: width / 2, centerY: height - radius - GLOBE_BOTTOM_GAP, radius };
}

function drawGlobe(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: Palette,
    view: View,
    atlas: GlobeAtlas | null,
) {
    const { centerX, centerY, radius } = globeFrame(width, height);
    const [centerLongitude, centerLatitude] = view.center;
    const projection = geoOrthographic()
        .scale(radius)
        .translate([centerX, centerY])
        .rotate([-centerLongitude, -centerLatitude])
        .clipAngle(90);
    const path = geoPath(projection, context);

    context.clearRect(0, 0, width, height);

    context.lineWidth = 0.6;
    context.strokeStyle = palette.graticule;
    context.beginPath();
    path(GRATICULE);
    context.stroke();

    context.strokeStyle = palette.rim;
    context.lineWidth = 0.8;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    context.stroke();

    if (!atlas) return;

    const strokeFocusEdge = (countryIndex: number, alpha: number) => {
        if (countryIndex < 0 || alpha <= 0) return;
        context.globalAlpha = alpha;
        context.strokeStyle = palette.focusEdge;
        context.lineWidth = 4;
        context.lineJoin = "round";
        context.beginPath();
        path(atlas.countries[countryIndex]);
        context.stroke();
        context.globalAlpha = 1;
    };
    strokeFocusEdge(view.previousFocusIndex, (1 - view.blend) * 0.6);
    strokeFocusEdge(view.focusIndex, view.blend * 0.6);

    context.lineWidth = 0.5;
    context.strokeStyle = palette.outline;
    context.beginPath();
    path(atlas.outlines);
    context.stroke();

    const { dots } = atlas;
    const sinCenter = Math.sin(centerLatitude * RADIANS);
    const cosCenter = Math.cos(centerLatitude * RADIANS);
    const centerLongitudeRadians = centerLongitude * RADIANS;

    const plotDots = (
        color: string,
        size: number,
        alpha: number,
        include: (index: number) => boolean,
        thinAtLimb = true,
    ) => {
        if (alpha <= 0) return;
        context.globalAlpha = alpha;
        context.fillStyle = color;
        context.beginPath();
        for (let index = 0; index < dots.count; index += 1) {
            if (!include(index)) continue;
            const deltaLongitude = dots.longitude[index] - centerLongitudeRadians;
            const cosDelta = Math.cos(deltaLongitude);
            const sinLatitude = dots.sinLatitude[index];
            const cosLatitude = dots.cosLatitude[index];
            const facing = sinCenter * sinLatitude + cosCenter * cosLatitude * cosDelta;
            if (
                facing <= 0 ||
                (thinAtLimb && facing < LIMB_BAND && dots.seed[index] * LIMB_BAND > facing)
            ) {
                continue;
            }
            const x = centerX + radius * cosLatitude * Math.sin(deltaLongitude);
            const y =
                centerY - radius * (cosCenter * sinLatitude - sinCenter * cosLatitude * cosDelta);
            context.rect(x - size / 2, y - size / 2, size, size);
        }
        context.fill();
        context.globalAlpha = 1;
    };

    plotDots(palette.dot, 1.3, 0.7, (index) => dots.restTone[index] === REST_TONE.light);
    plotDots(palette.denseDot, 1.3, 0.85, (index) => dots.restTone[index] === REST_TONE.dense);
    plotDots(
        palette.focusDot,
        2.1,
        1 - view.blend,
        (index) => dots.country[index] === view.previousFocusIndex,
        false,
    );
    plotDots(
        palette.focusDot,
        2.1,
        view.blend,
        (index) => dots.country[index] === view.focusIndex,
        false,
    );
}

export default function ProblemGlobe({
    focus,
    reduceMotion,
}: {
    focus: GlobeFocus;
    reduceMotion: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const atlasRef = useRef<GlobeAtlas | null>(null);
    const viewRef = useRef<View>({
        center: focus.center,
        focusIndex: -1,
        previousFocusIndex: -1,
        blend: 1,
    });
    const redrawRef = useRef<() => void>(() => {});
    const [atlasReady, setAtlasReady] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        const palette = readPalette();
        let width = 0;
        let height = 0;

        const redraw = () =>
            drawGlobe(context, width, height, palette, viewRef.current, atlasRef.current);

        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            redraw();
        };

        redrawRef.current = redraw;
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);

        let cancelled = false;
        loadGlobeAtlas().then((atlas) => {
            if (cancelled) return;
            atlasRef.current = atlas;
            setAtlasReady(true);
        });

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const atlas = atlasRef.current;
        if (!atlas) return;
        const view = viewRef.current;
        const targetIndex = atlas.countryIndexByName.get(focus.country) ?? -1;

        if (view.focusIndex === -1 || reduceMotion) {
            viewRef.current = {
                center: focus.center,
                focusIndex: targetIndex,
                previousFocusIndex: -1,
                blend: 1,
            };
            redrawRef.current();
            return;
        }

        const travel = geoInterpolate(view.center, focus.center);
        const previousFocusIndex = view.focusIndex;
        const startedAt = performance.now();
        let frame = 0;

        const step = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / TURN_DURATION_MS);
            const eased = easeInOutCubic(progress);
            viewRef.current = {
                center: travel(eased),
                focusIndex: targetIndex,
                previousFocusIndex,
                blend: eased,
            };
            redrawRef.current();
            if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [focus, reduceMotion, atlasReady]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={`absolute inset-0 size-full transition-opacity duration-700 ${atlasReady ? "opacity-100" : "opacity-0"}`}
        />
    );
}
