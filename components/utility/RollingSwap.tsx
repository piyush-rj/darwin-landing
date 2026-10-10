"use client";

import { AnimatePresence, motion, usePresenceData, useReducedMotion } from "motion/react";

import {
    EASE_IN_OUT,
    PACE_STEP_SECONDS,
    PARKED_GAP_EM,
    parkedOffset,
    RESTING_Y,
    rollsTwice,
    seededRandom,
} from "@/components/utility/RollingText";

const SWAP_SECONDS = 0.6;

export type RollDirection = "up" | "down";

function SwapWord({ text }: { text: string }) {
    const direction: RollDirection = usePresenceData() ?? "up";
    const sign: 1 | -1 = direction === "up" ? 1 : -1;

    return (
        <motion.span
            aria-hidden
            initial="hidden"
            animate="shown"
            exit="gone"
            className="col-start-1 row-start-1 whitespace-pre"
        >
            {[...text].map((character, index) => {
                const pace = 1 + Math.floor(seededRandom(index * 104729)() * 5);
                const transition = {
                    duration: SWAP_SECONDS,
                    delay: index * pace * PACE_STEP_SECONDS,
                    ease: EASE_IN_OUT,
                };
                const doubled = rollsTwice(character, index);
                return (
                    <motion.span
                        key={index}
                        variants={{
                            hidden: { y: parkedOffset(doubled, sign), opacity: 0 },
                            shown: {
                                y: RESTING_Y,
                                opacity: 1,
                                transition: {
                                    ...transition,
                                    opacity: {
                                        duration: SWAP_SECONDS * 0.6,
                                        delay: transition.delay + SWAP_SECONDS * 0.2,
                                    },
                                },
                            },
                            gone: {
                                y: parkedOffset(false, sign === 1 ? -1 : 1),
                                opacity: 0,
                                transition: {
                                    ...transition,
                                    opacity: {
                                        duration: SWAP_SECONDS * 0.6,
                                        delay: transition.delay,
                                    },
                                },
                            },
                        }}
                        className="relative inline-block"
                    >
                        {doubled && (
                            <span
                                className="absolute inset-x-0"
                                style={
                                    sign > 0
                                        ? { bottom: `calc(100% + ${PARKED_GAP_EM}em)` }
                                        : { top: `calc(100% + ${PARKED_GAP_EM}em)` }
                                }
                            >
                                {character}
                            </span>
                        )}
                        {character}
                    </motion.span>
                );
            })}
        </motion.span>
    );
}

export default function RollingSwap({
    text,
    direction = "up",
}: {
    text: string;
    direction?: RollDirection;
}) {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) return <span>{text}</span>;

    return (
        <span className="relative inline-grid justify-items-center overflow-y-clip py-[0.12em] align-top">
            <span className="sr-only">{text}</span>
            <AnimatePresence custom={direction}>
                <SwapWord key={text} text={text} />
            </AnimatePresence>
        </span>
    );
}
