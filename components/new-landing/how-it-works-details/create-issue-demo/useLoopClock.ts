"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function useLoopClock(loopMs: number, stillFrameMs: number) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.3 });
    const reduceMotion = useReducedMotion();
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (!inView || reduceMotion) return;
        const startedAt = performance.now();
        let frame = requestAnimationFrame(function tick(now) {
            setTime((now - startedAt) % loopMs);
            frame = requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(frame);
    }, [inView, reduceMotion, loopMs]);

    return { ref, time: reduceMotion ? stillFrameMs : time };
}
