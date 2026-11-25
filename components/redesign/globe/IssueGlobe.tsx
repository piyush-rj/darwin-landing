"use client";

import { useEffect, useRef } from "react";

export type GlobeFocus = { lng: number; lat: number; countryId: number };

type DotField = {
    count: number;
    lng: Float32Array;
    cosLat: Float32Array;
    sinLat: Float32Array;
    country: Uint8Array;
    screenX: Float32Array;
    screenY: Float32Array;
    depth: Float32Array;
};

const DOT_BYTES = 5;
const DEG = Math.PI / 180;
const GRATICULE_STEP_DEG = 15;
const GRATICULE_SAMPLE_DEG = 3;
const IDLE_SPIN_DEG_PER_SEC = 1.4;
const FOCUS_EASE = 0.045;
const HIGHLIGHT_EASE = 0.06;
const DRAG_DEG_PER_PX = 0.22;
const MAX_TILT_DEG = 60;
const DEPTH_BUCKETS = [
    { minDepth: 0.62, alpha: 0.92, radius: 1 },
    { minDepth: 0.3, alpha: 0.6, radius: 0.85 },
    { minDepth: 0, alpha: 0.3, radius: 0.7 },
];

async function loadDotField(signal: AbortSignal): Promise<DotField> {
    const buffer = await (await fetch("/landing/issue-dots.bin", { signal })).arrayBuffer();
    const view = new DataView(buffer);
    const count = Math.floor(buffer.byteLength / DOT_BYTES);
    const field: DotField = {
        count,
        lng: new Float32Array(count),
        cosLat: new Float32Array(count),
        sinLat: new Float32Array(count),
        country: new Uint8Array(count),
        screenX: new Float32Array(count),
        screenY: new Float32Array(count),
        depth: new Float32Array(count),
    };
    for (let i = 0; i < count; i++) {
        const offset = i * DOT_BYTES;
        const lat = (view.getInt16(offset + 2, true) / 100) * DEG;
        field.lng[i] = (view.getInt16(offset, true) / 100) * DEG;
        field.cosLat[i] = Math.cos(lat);
        field.sinLat[i] = Math.sin(lat);
        field.country[i] = view.getUint8(offset + 4);
    }
    return field;
}

function shortestTurn(from: number, to: number) {
    return ((((to - from) % 360) + 540) % 360) - 180;
}

function withAlpha(color: string, alpha: number) {
    return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

export default function IssueGlobe({
    focus,
    frozen,
    className,
}: {
    focus: GlobeFocus;
    frozen: boolean;
    className?: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const focusRef = useRef(focus);

    useEffect(() => {
        focusRef.current = focus;
    }, [focus]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const abort = new AbortController();
        const style = getComputedStyle(canvas);
        const ink = style.color;
        const highlight = style.textDecorationColor;
        const ringStroke = withAlpha(ink, 0.35);
        const outerRingStroke = withAlpha(ink, 0.14);
        const graticuleStroke = withAlpha(ink, 0.16);
        const bucketFills = DEPTH_BUCKETS.map((bucket) => withAlpha(ink, bucket.alpha));

        let field: DotField | null = null;
        let width = 0;
        let height = 0;
        let radius = 0;
        let baseDot = 1;
        let visible = true;
        let frame = 0;
        let lastTime = 0;
        let lastFocus = focusRef.current;
        const view = { lng: lastFocus.lng, lat: lastFocus.lat };
        const target = { lng: lastFocus.lng, lat: lastFocus.lat };
        const highlightWeight = new Float32Array(256);
        const drag = { active: false, x: 0, y: 0 };

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas!.clientWidth;
            height = canvas!.clientHeight;
            canvas!.width = Math.round(width * dpr);
            canvas!.height = Math.round(height * dpr);
            context!.setTransform(dpr, 0, 0, dpr, 0, 0);
            radius = Math.min(width * 0.46, height * 0.4);
            baseDot = Math.max(0.9, radius * 0.0028);
        }

        function project(
            cosLat: number,
            sinLat: number,
            lng: number,
            cosLat0: number,
            sinLat0: number,
            lng0: number,
        ) {
            const dLng = lng - lng0;
            const cosDLng = Math.cos(dLng);
            const x = cosLat * Math.sin(dLng);
            const y = cosLat0 * sinLat - sinLat0 * cosLat * cosDLng;
            const z = sinLat0 * sinLat + cosLat0 * cosLat * cosDLng;
            return [x, y, z] as const;
        }

        function traceArc(
            points: Iterable<readonly [cosLat: number, sinLat: number, lng: number]>,
            cx: number,
            cy: number,
            cosLat0: number,
            sinLat0: number,
            lng0: number,
        ) {
            let pen = false;
            for (const [cosLat, sinLat, lng] of points) {
                const [x, y, z] = project(cosLat, sinLat, lng, cosLat0, sinLat0, lng0);
                if (z < -0.02) {
                    pen = false;
                    continue;
                }
                const sx = cx + x * radius;
                const sy = cy - y * radius;
                if (pen) context!.lineTo(sx, sy);
                else context!.moveTo(sx, sy);
                pen = true;
            }
        }

        function* meridian(lngDeg: number) {
            for (let lat = -90; lat <= 90; lat += GRATICULE_SAMPLE_DEG)
                yield [Math.cos(lat * DEG), Math.sin(lat * DEG), lngDeg * DEG] as const;
        }

        function* parallel(latDeg: number) {
            const cosLat = Math.cos(latDeg * DEG);
            const sinLat = Math.sin(latDeg * DEG);
            for (let lng = 0; lng <= 360; lng += GRATICULE_SAMPLE_DEG)
                yield [cosLat, sinLat, lng * DEG] as const;
        }

        function drawGraticule(
            cx: number,
            cy: number,
            cosLat0: number,
            sinLat0: number,
            lng0: number,
        ) {
            context!.save();
            context!.beginPath();
            context!.arc(cx, cy, radius, 0, Math.PI * 2);
            context!.clip();
            context!.strokeStyle = graticuleStroke;
            context!.lineWidth = 0.75;
            context!.beginPath();
            for (let lng = 0; lng < 360; lng += GRATICULE_STEP_DEG)
                traceArc(meridian(lng), cx, cy, cosLat0, sinLat0, lng0);
            for (let lat = -75; lat <= 75; lat += GRATICULE_STEP_DEG)
                traceArc(parallel(lat), cx, cy, cosLat0, sinLat0, lng0);
            context!.stroke();
            context!.restore();
        }

        function drawDots(cx: number, cy: number, cosLat0: number, sinLat0: number, lng0: number) {
            const { count, cosLat, sinLat, lng, screenX, screenY, depth } = field!;
            for (let i = 0; i < count; i++) {
                const [x, y, z] = project(cosLat[i], sinLat[i], lng[i], cosLat0, sinLat0, lng0);
                depth[i] = z;
                screenX[i] = cx + x * radius;
                screenY[i] = cy - y * radius;
            }
            DEPTH_BUCKETS.forEach((bucket, index) => {
                const maxDepth = index === 0 ? 2 : DEPTH_BUCKETS[index - 1].minDepth;
                const r = baseDot * bucket.radius;
                context!.fillStyle = bucketFills[index];
                context!.beginPath();
                for (let i = 0; i < count; i++) {
                    const z = depth[i];
                    if (z < bucket.minDepth || z >= maxDepth) continue;
                    context!.moveTo(screenX[i] + r, screenY[i]);
                    context!.arc(screenX[i], screenY[i], r, 0, Math.PI * 2);
                }
                context!.fill();
            });
        }

        function drawHighlights(time: number) {
            const { count, country, screenX, screenY, depth } = field!;
            const pulse = 1 + 0.18 * Math.sin(time / 420);
            for (let id = 0; id < highlightWeight.length; id++) {
                const weight = highlightWeight[id];
                if (weight < 0.01) continue;
                const r = baseDot * (1 + 0.7 * weight * pulse);
                context!.fillStyle = withAlpha(highlight, Math.min(1, weight * 1.1));
                context!.beginPath();
                for (let i = 0; i < count; i++) {
                    if (country[i] !== id || depth[i] < 0) continue;
                    context!.moveTo(screenX[i] + r, screenY[i]);
                    context!.arc(screenX[i], screenY[i], r, 0, Math.PI * 2);
                }
                context!.fill();
            }
        }

        function draw(time: number) {
            frame = 0;
            if (!visible) return;
            const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
            lastTime = time;

            const current = focusRef.current;
            if (current !== lastFocus) {
                lastFocus = current;
                target.lng = current.lng;
                target.lat = current.lat;
            }
            if (!frozen && !drag.active) target.lng += IDLE_SPIN_DEG_PER_SEC * dt;

            const ease = frozen ? 1 : FOCUS_EASE;
            view.lng += shortestTurn(view.lng, target.lng) * ease;
            view.lat += (target.lat - view.lat) * ease;
            for (let id = 0; id < highlightWeight.length; id++) {
                const goal = id === current.countryId ? 1 : 0;
                highlightWeight[id] += (goal - highlightWeight[id]) * (frozen ? 1 : HIGHLIGHT_EASE);
            }

            const cx = width / 2;
            const cy = height * 0.5;
            const lng0 = view.lng * DEG;
            const lat0 = view.lat * DEG;
            const cosLat0 = Math.cos(lat0);
            const sinLat0 = Math.sin(lat0);

            context!.clearRect(0, 0, width, height);
            context!.lineWidth = 1;
            context!.strokeStyle = ringStroke;
            context!.beginPath();
            context!.arc(cx, cy, radius, 0, Math.PI * 2);
            context!.stroke();
            context!.strokeStyle = outerRingStroke;
            context!.beginPath();
            context!.arc(cx, cy, radius * 1.014, 0, Math.PI * 2);
            context!.stroke();
            drawGraticule(cx, cy, cosLat0, sinLat0, lng0);
            if (field) {
                drawDots(cx, cy, cosLat0, sinLat0, lng0);
                drawHighlights(time);
            }

            frame = requestAnimationFrame(draw);
        }

        function schedule() {
            if (!frame && visible) frame = requestAnimationFrame(draw);
        }

        function onPointerDown(event: PointerEvent) {
            drag.active = true;
            drag.x = event.clientX;
            drag.y = event.clientY;
            canvas!.setPointerCapture(event.pointerId);
        }
        function onPointerMove(event: PointerEvent) {
            if (!drag.active) return;
            const dx = event.clientX - drag.x;
            const dy = event.clientY - drag.y;
            drag.x = event.clientX;
            drag.y = event.clientY;
            target.lng -= dx * DRAG_DEG_PER_PX;
            target.lat = Math.max(
                -MAX_TILT_DEG,
                Math.min(MAX_TILT_DEG, target.lat + dy * DRAG_DEG_PER_PX),
            );
        }
        function onPointerUp() {
            drag.active = false;
        }

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        const intersection = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            lastTime = 0;
            schedule();
        });
        intersection.observe(canvas);
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);

        resize();
        schedule();
        loadDotField(abort.signal)
            .then((loaded) => {
                field = loaded;
                schedule();
            })
            .catch(() => {});

        return () => {
            abort.abort();
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            intersection.disconnect();
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
        };
    }, [frozen]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={`block h-full w-full cursor-grab touch-pan-y text-stone-900 decoration-amber-500 active:cursor-grabbing ${className ?? ""}`}
        />
    );
}
