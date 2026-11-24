"use client";

import { stagger, useAnimate, useReducedMotion } from "motion/react";
import { useLayoutEffect } from "react";

import { WAITLIST_EMAIL_INPUT_ID } from "../WaitlistPill";
import BlockTrail from "./BlockTrail";
import MosaicPainting from "./MosaicPainting";
import { PlainTicketLink, SolidTicketButton, TicketBridge } from "./TicketButtons";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const UNROLL = [0.65, 0, 0.25, 1] as const;
const BAND_HIDDEN = "inset(0% 0% 100% 0%)";
const LINE_HIDDEN = "translateY(105%)";

const HEADLINE_LINES = ["Issues in.", "Pull requests out."];

function focusWaitlist() {
    document.getElementById(WAITLIST_EMAIL_INPUT_ID)?.focus();
}

export default function HeroSection() {
    const [scope, animate] = useAnimate();
    const reduceMotion = useReducedMotion();

    useLayoutEffect(() => {
        const pace = reduceMotion ? 0 : 1;
        const sequence = animate([
            [
                "[data-hero-band]",
                { clipPath: [BAND_HIDDEN, "inset(0% 0% 0% 0%)"] },
                { duration: 1.3 * pace, at: 0.15 * pace, ease: UNROLL },
            ],
            [
                "[data-hero-painting]",
                { transform: ["scale(1.08)", "scale(1)"] },
                { duration: 1.9 * pace, at: 0.15 * pace, ease: EASE_OUT },
            ],
            [
                "[data-hero-line]",
                { transform: [LINE_HIDDEN, "translateY(0%)"] },
                {
                    duration: 0.9 * pace,
                    at: 0.7 * pace,
                    delay: stagger(0.08 * pace),
                    ease: EASE_OUT,
                },
            ],
            [
                "[data-hero-aside] > *",
                { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] },
                { duration: 0.7 * pace, at: 1 * pace, delay: stagger(0.1 * pace), ease: EASE_OUT },
            ],
        ]);
        return () => sequence.stop();
    }, [animate, reduceMotion]);

    return (
        <section
            ref={scope}
            aria-labelledby="hero-title"
            className="flex min-h-svh flex-col bg-paper md:h-svh md:min-h-[640px]"
        >
            <div
                data-hero-band
                className="relative min-h-[340px] flex-1 overflow-hidden bg-stone-900"
                style={{ clipPath: BAND_HIDDEN }}
            >
                <div data-hero-painting className="absolute inset-0">
                    <MosaicPainting />
                    <BlockTrail />
                </div>
            </div>

            <div className="px-4 md:px-8">
                <div className="mx-auto grid max-w-page gap-7 py-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-12">
                    <h1
                        id="hero-title"
                        className="text-[44px] leading-none font-medium tracking-[-0.05em] text-stone-950 sm:text-[56px] md:text-[64px] lg:text-[80px]"
                    >
                        {HEADLINE_LINES.map((line) => (
                            <span
                                key={line}
                                className="-mb-[0.12em] block overflow-hidden pb-[0.12em]"
                            >
                                <span
                                    data-hero-line
                                    className="block"
                                    style={{ transform: LINE_HIDDEN }}
                                >
                                    {line}
                                </span>
                            </span>
                        ))}
                    </h1>

                    <div data-hero-aside className="flex max-w-[360px] flex-col gap-5 md:pb-1.5">
                        <p className="text-[15px] leading-[1.55] text-stone-600 opacity-0">
                            Darwin picks up issues from your board, works each one in a sandboxed
                            runner and opens a tested pull request.
                        </p>
                        <div className="flex items-center opacity-0">
                            <SolidTicketButton label="Join waitlist" onClick={focusWaitlist} />
                            <TicketBridge fill="bg-linear-to-r from-stone-900 to-stone-200" />
                            <PlainTicketLink href="#inside-darwin" label="Watch it work" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
