"use client";

import { useInView } from "motion/react";
import Link from "next/link";
import { type ComponentType, useEffect, useRef } from "react";

import { CtaArrowIcon } from "@/components/icons";
import FadeIn from "@/components/new-landing/FadeIn";
import { cn } from "@/lib/utils";

import type { PixelGlyph } from "../PixelGlyphs";
import { useVisualTicker } from "../useVisualTicker";
import { FRAME_MS } from "./loopTimeline";
import ToneMosaic from "./ToneMosaic";

export type LoopStepContent = {
    id: string;
    nav: string;
    title: string;
    body: string;
    link: { label: string; href: string };
    tone: string;
    icon: PixelGlyph;
    frames: { from: number; to: number };
    stage: ComponentType<{ frame: number; cycle: number }>;
};

export default function LoopStep({
    step,
    index,
    onActive,
}: {
    step: LoopStepContent;
    index: number;
    onActive: (index: number) => void;
}) {
    const rowRef = useRef<HTMLElement>(null);
    const centered = useInView(rowRef, { margin: "-45% 0px -45% 0px" });
    const { ref, frame, cycle } = useVisualTicker(FRAME_MS, step.frames.to - step.frames.from);

    useEffect(() => {
        if (centered) onActive(index);
    }, [centered, index, onActive]);

    return (
        <article
            ref={rowRef}
            id={step.id}
            className="grid scroll-mt-16 border-b border-edge last:border-b-0 lg:grid-cols-2"
        >
            <div
                className={cn(
                    "flex flex-col justify-center px-6 py-12 md:px-9 md:py-14 lg:py-20",
                    index % 2 === 1 && "lg:order-last",
                )}
            >
                <FadeIn className="max-w-[28rem]">
                    <h3 className="text-[34px] leading-[1.08] font-semibold tracking-[-0.03em] text-foreground sm:text-[40px]">
                        {step.title}
                    </h3>
                    <p className="mt-5 text-[17px] leading-[1.55] text-neutral-500">{step.body}</p>
                    <Link
                        href={step.link.href}
                        className="group mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-foreground transition-colors hover:text-primary"
                    >
                        {step.link.label}
                        <CtaArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </FadeIn>
            </div>

            <div
                ref={ref}
                aria-hidden
                className={cn(
                    "border-t border-edge lg:border-t-0",
                    index % 2 === 1 ? "lg:border-r" : "lg:border-l",
                )}
            >
                <FadeIn y={0} delay={0.1} className="lg:h-full">
                    <ToneMosaic
                        tone={step.tone}
                        className="sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[30rem]"
                    >
                        <step.stage frame={step.frames.from + frame} cycle={cycle} />
                    </ToneMosaic>
                </FadeIn>
            </div>
        </article>
    );
}
