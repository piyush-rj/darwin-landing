"use client";

import { useInView, useReducedMotion } from "motion/react";
import { type CSSProperties, useRef } from "react";

import { CtaArrowIcon, FooterLinkHoverArrowIcon } from "@/components/icons";
import FadeIn from "@/components/new-landing/FadeIn";
import { ToneTiles } from "@/components/new-landing/how-it-works/ToneMosaic";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";
import { cn } from "@/lib/utils";
import { focusNavbarWaitlist } from "@/lib/waitlist/focusNavbarWaitlist";

import PixelPickaxe from "./PixelPickaxe";

const WHY_TONE = "#F59E0B";
const TILE_PX = 96;
const TILE_STRENGTHS = [34, 44, 52, 60, 68, 82, 22, 56];

export default function WhyHero() {
    const stageRef = useRef<HTMLDivElement>(null);
    const inView = useInView(stageRef, { once: true, amount: 0.15 });
    const reduceMotion = useReducedMotion();

    return (
        <section className="grid w-full border-b border-edge bg-ink lg:h-[calc(100svh-2.75rem)] lg:min-h-[44rem] lg:grid-cols-2">
            <div className="flex flex-col px-6 pt-10 pb-10 md:px-9 lg:pt-8 lg:pb-12">
                <p className={MONO_LABEL}>Why Darwin</p>
                <h1 className="mt-12 text-[44px] leading-[0.95] font-normal tracking-[-0.045em] text-foreground sm:text-[72px] lg:mt-[9svh] lg:text-[calc(5.8vw-8px)] lg:whitespace-nowrap">
                    <RollingText text={"Nobody picked it up.\nDarwin did."} />
                </h1>
                <div className="mt-6 flex flex-col text-neutral-400">
                    {[0, 1, 2].map((arrow) => (
                        <FooterLinkHoverArrowIcon
                            key={arrow}
                            className={cn("size-5", arrow === 1 && "text-foreground")}
                        />
                    ))}
                </div>
                <FadeIn delay={0.35} className="mt-auto pt-14">
                    <p className="max-w-[34ch] text-[20px] leading-[1.35] tracking-[-0.01em] text-foreground lg:text-[22px]">
                        The teammate that picks up the issues nobody gets to and hands each one back
                        as a tested pull request.
                    </p>
                </FadeIn>
                <button
                    type="button"
                    onClick={focusNavbarWaitlist}
                    className="mt-8 flex w-fit cursor-pointer items-center gap-3 bg-foreground px-5 py-3 text-[16px] text-ink transition-opacity hover:opacity-85"
                >
                    Join the waitlist
                    <CtaArrowIcon className="size-4" />
                </button>
            </div>

            <div
                ref={stageRef}
                className="theme-light relative flex h-[30rem] justify-center overflow-hidden border-edge max-lg:border-t sm:h-[36rem] lg:h-auto lg:border-l"
                style={{ "--tone": WHY_TONE } as CSSProperties}
            >
                <ToneTiles
                    tone={WHY_TONE}
                    shown={inView || !!reduceMotion}
                    animate={!reduceMotion}
                    tileSize={TILE_PX}
                    strengths={TILE_STRENGTHS}
                />
                <div className="relative pt-16 [--head:min(60vw,240px)] lg:pt-[12svh] lg:[--head:clamp(240px,22vw,336px)]">
                    <PixelPickaxe />
                </div>
            </div>
        </section>
    );
}
