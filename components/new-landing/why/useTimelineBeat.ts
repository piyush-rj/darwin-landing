"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Beat = { at: number };
type BeatPosition = { beat: number; cycle: number };

export function useTimelineBeat<T extends Beat>(beats: T[], loopMs: number, stillBeat: number) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.25 });
    const reduceMotion = useReducedMotion();
    const [position, setPosition] = useState<BeatPosition>({ beat: 0, cycle: 0 });
    const latest = useRef(position);

    useEffect(() => {
        if (!inView || reduceMotion) return;
        let timer = 0;
        const advance = () => {
            const { beat, cycle } = latest.current;
            const wraps = beat + 1 === beats.length;
            const wait = (wraps ? loopMs : beats[beat + 1].at) - beats[beat].at;
            timer = window.setTimeout(() => {
                const next = { beat: wraps ? 0 : beat + 1, cycle: wraps ? cycle + 1 : cycle };
                latest.current = next;
                setPosition(next);
                advance();
            }, wait);
        };
        advance();
        return () => window.clearTimeout(timer);
    }, [inView, reduceMotion, beats, loopMs]);

    if (reduceMotion) return { ref, beat: beats[stillBeat], cycle: 0 };
    return { ref, beat: beats[position.beat], cycle: position.cycle };
}
