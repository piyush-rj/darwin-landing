"use client";

import { useState } from "react";

import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";

import HotbarNav from "./HotbarNav";
import BoardStage from "./how-it-works/BoardStage";
import LoopStep, { type LoopStepContent } from "./how-it-works/LoopStep";
import { BOARD_LOOP, LOOP } from "./how-it-works/loopTimeline";
import PullRequestStage from "./how-it-works/PullRequestStage";
import RunnerStage from "./how-it-works/RunnerStage";
import { BoardGlyph, PullRequestGlyph, TerminalGlyph } from "./PixelGlyphs";

const STEPS: LoopStepContent[] = [
    {
        id: "how-board",
        nav: "Picked up from the board",
        title: "You file the issue. Darwin picks it up.",
        body: "Keep the board your team already uses. Darwin claims well-scoped issues the moment they land and moves them into progress.",
        link: { label: "Open your board", href: "/login" },
        tone: "var(--color-orange-500)",
        icon: BoardGlyph,
        frames: { from: 0, to: BOARD_LOOP.frames },
        stage: BoardStage,
    },
    {
        id: "how-runner",
        nav: "Fixed inside a runner",
        title: "We fix it in a runner. Your tests decide.",
        body: "Every fix runs in a sandboxed runner that clones your repo, makes the change and runs your real test suite. Nothing ships on a guess.",
        link: { label: "Why runners matter", href: "/why" },
        tone: "var(--color-sky-500)",
        icon: TerminalGlyph,
        frames: { from: LOOP.firstLog - 1, to: LOOP.opened + 4 },
        stage: RunnerStage,
    },
    {
        id: "how-pull-request",
        nav: "Shipped as a pull request",
        title: "We open the pull request. You merge it.",
        body: "Darwin hands back a pull request with the passing checks attached. Review it like a teammate's work, merge it, and the issue closes itself.",
        link: { label: "See what shipped", href: "/blog?tab=changelog" },
        tone: "var(--color-emerald-500)",
        icon: PullRequestGlyph,
        frames: { from: LOOP.opened, to: LOOP.frames },
        stage: PullRequestStage,
    },
];

export default function HowItWorksSection() {
    const [active, setActive] = useState(0);

    return (
        <section id="how-it-works" className="w-full border-b border-edge bg-ink text-foreground">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <div className="border-edge px-6 pt-20 pb-12 md:px-9 lg:border-r lg:pt-28">
                    <p className={MONO_LABEL}>How it works</p>
                    <h2 className="mt-5 max-w-[16ch] text-[40px] leading-[1] font-medium tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                        <RollingText text="One issue in. One tested pull request out." />
                    </h2>
                </div>
                <div className="flex items-end bg-mist px-6 py-10 max-lg:border-t max-lg:border-edge md:px-9">
                    <FadeIn delay={0.15}>
                        <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                            Darwin takes the issue from your board, fixes it where your code really
                            runs and comes back with something you can merge.
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="grid border-t border-edge lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <aside className="hidden border-r border-edge px-6 py-12 md:px-9 lg:block">
                    <HotbarNav
                        label="How it works"
                        active={active}
                        items={STEPS.map((step) => ({
                            id: step.id,
                            label: step.nav,
                            icon: step.icon,
                            tone: step.tone,
                        }))}
                    />
                </aside>

                <div>
                    {STEPS.map((step, index) => (
                        <LoopStep key={step.id} step={step} index={index} onActive={setActive} />
                    ))}
                </div>
            </div>
        </section>
    );
}
