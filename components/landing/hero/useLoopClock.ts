"use client";

import { useInView, useReducedMotion } from "motion/react";
import { type RefObject, useEffect, useState } from "react";

export function useLoopClock(
    targetRef: RefObject<HTMLElement | null>,
    moments: number[],
    loopMs: number,
    restingMoment: number,
) {
    const inView = useInView(targetRef, { margin: "-10% 0px" });
    const reduceMotion = useReducedMotion();
    const running = inView && !reduceMotion;
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (!running) return;
        let timers: number[] = [];
        const playLoop = () => {
            timers = moments.map((moment) => window.setTimeout(() => setTime(moment), moment));
            timers.push(window.setTimeout(playLoop, loopMs));
        };
        playLoop();
        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [running, moments, loopMs]);

    return reduceMotion ? restingMoment : time;
}
