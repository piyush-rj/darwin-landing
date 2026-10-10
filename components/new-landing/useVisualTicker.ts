"use client";

import { useInView, useReducedMotion } from "motion/react";
import { type RefObject, useEffect, useRef, useState } from "react";

export function useVisualTicker(
    intervalMs: number,
    frames: number,
): { ref: RefObject<HTMLDivElement | null>; frame: number; cycle: number } {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.4 });
    const reduceMotion = useReducedMotion();
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!inView || reduceMotion) return;
        const timer = window.setInterval(() => setTick((current) => current + 1), intervalMs);
        return () => window.clearInterval(timer);
    }, [inView, reduceMotion, intervalMs]);

    if (reduceMotion) return { ref, frame: frames - 1, cycle: 0 };
    return { ref, frame: tick % frames, cycle: Math.floor(tick / frames) };
}
