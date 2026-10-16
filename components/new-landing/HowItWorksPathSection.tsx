"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import RollingText from "@/components/utility/RollingText";

import StatusBlock, { STATUS_BLOCK_ORDER } from "./StatusBlock";

const PIXEL_SCALE = 3;
const DROP_HEIGHT = PIXEL_SCALE * 8;
const DROP_SECONDS = 0.32;
const DROP_STAGGER_SECONDS = 0.15;
const HOP_START_SECONDS = 1.2;
const HOP_STAGGER_SECONDS = 0.15;
const HOP_SECONDS = 0.36;
const HOP_HEIGHT = PIXEL_SCALE * 3;

function inSteps(count: number) {
    return (progress: number) => Math.ceil(progress * count) / count;
}

export default function HowItWorksPathSection() {
    const rowRef = useRef<HTMLDivElement>(null);
    const rowInView = useInView(rowRef, { once: true, amount: 0.6 });
    const reduceMotion = useReducedMotion();
    const lastIndex = STATUS_BLOCK_ORDER.length - 1;

    return (
        <section className="flex w-full flex-col items-center border-b border-edge bg-ink px-6 py-20 md:py-24">
            <div ref={rowRef} className="flex items-center gap-8">
                {STATUS_BLOCK_ORDER.map((status, index) => {
                    const isDone = index === lastIndex;
                    return (
                        <motion.div
                            key={status}
                            initial={reduceMotion ? false : { y: 0, scale: 1 }}
                            animate={
                                rowInView
                                    ? {
                                          y: [0, -(isDone ? HOP_HEIGHT * 2 : HOP_HEIGHT), 0],
                                          scale: isDone ? [1, 1.15, 1] : 1,
                                      }
                                    : undefined
                            }
                            transition={{
                                delay: HOP_START_SECONDS + index * HOP_STAGGER_SECONDS,
                                duration: isDone ? HOP_SECONDS * 1.5 : HOP_SECONDS,
                                ease: inSteps(4),
                            }}
                        >
                            <motion.div
                                initial={reduceMotion ? false : { y: -DROP_HEIGHT, opacity: 0 }}
                                animate={rowInView ? { y: 0, opacity: 1 } : undefined}
                                transition={{
                                    delay: index * DROP_STAGGER_SECONDS,
                                    duration: DROP_SECONDS,
                                    ease: inSteps(4),
                                }}
                            >
                                <StatusBlock
                                    status={status}
                                    scale={PIXEL_SCALE}
                                    className="block"
                                />
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
            <h2 className="mt-10 text-center text-[36px] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-foreground sm:text-[44px] lg:text-[52px]">
                <RollingText text="You file it. Darwin moves it to done." />
            </h2>
        </section>
    );
}
