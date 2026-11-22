"use client";

import HairlineFigure from "@/components/utility/HairlineFigure";
import type { FigureMount } from "@/lib/hairline/core/stage";
import { mountClaimWork } from "@/lib/hairline/figures/claimWork";
import { mountPullRequestFlow } from "@/lib/hairline/figures/pullRequestFlow";
import { mountSandboxTests } from "@/lib/hairline/figures/sandboxTests";

import SectionHeader from "./SectionHeader";
import { usePerforatedEdge } from "./usePerforatedEdge";

type Stage = {
    number: string;
    title: string;
    body: string;
    figure: FigureMount;
    figureLabel: string;
    status: { label: string; tone: string };
};

const STAGES: Stage[] = [
    {
        number: "01",
        title: "You file the issue. Darwin picks it up.",
        body: "Keep the board your team already uses. Darwin claims well-scoped issues the moment they land and moves them into progress.",
        figure: mountClaimWork,
        figureLabel:
            "An issue card is lifted from To do and dropped into In progress on the board.",
        status: { label: "In progress", tone: "bg-sky-400" },
    },
    {
        number: "02",
        title: "We fix it in a runner. Your tests decide.",
        body: "Every fix runs in a sandboxed runner that clones your repo, makes the change and runs your real test suite. Nothing ships on a guess.",
        figure: mountSandboxTests,
        figureLabel: "A fix runs inside a sandbox while the test suite checks it.",
        status: { label: "212 tests passed", tone: "bg-amber-400" },
    },
    {
        number: "03",
        title: "We open the pull request. You merge it.",
        body: "Darwin hands back a pull request with the passing checks attached. Review it like a teammate's work, merge it, and the issue closes itself.",
        figure: mountPullRequestFlow,
        figureLabel: "A pull request is opened, reviewed and merged.",
        status: { label: "Merged", tone: "bg-violet-500" },
    },
];

function StageArt({ stage }: { stage: Stage }) {
    return (
        <div className="flex h-72 items-center justify-center bg-plate px-4 [--figure-ground:var(--color-plate)] [--figure-ink:var(--color-stone-900)] md:h-80">
            <HairlineFigure figure={stage.figure} value={0} label={stage.figureLabel} />
        </div>
    );
}

function StageNumber({ stage }: { stage: Stage }) {
    return (
        <div className="flex items-end justify-between">
            <span className="flex items-center gap-2 text-[13px] text-stone-600">
                <span className={`size-2 shrink-0 ${stage.status.tone}`} />
                {stage.status.label}
            </span>
            <span className="text-[44px] leading-[0.8] font-light tracking-[-0.04em] text-stone-950 tabular-nums">
                {stage.number}
            </span>
        </div>
    );
}

function StageCaption({ stage }: { stage: Stage }) {
    return (
        <figcaption>
            <p className="text-[21px] leading-[1.2] font-medium tracking-[-0.025em] text-balance text-stone-950">
                {stage.title}
            </p>
            <p className="mt-2 text-[14px] leading-snug text-stone-500">{stage.body}</p>
        </figcaption>
    );
}

function StageTicket({ stage, index }: { stage: Stage; index: number }) {
    const artFirst = index % 2 === 1;
    const [edgeRef, edgeStyle] = usePerforatedEdge<HTMLElement>();
    return (
        <div className="drop-shadow-sm">
            <figure ref={edgeRef} style={edgeStyle} className="flex h-full flex-col bg-snow p-3">
                {artFirst && <StageArt stage={stage} />}
                <div className="flex flex-1 flex-col justify-between gap-12 px-4 py-6 md:px-5">
                    {artFirst ? (
                        <>
                            <StageCaption stage={stage} />
                            <StageNumber stage={stage} />
                        </>
                    ) : (
                        <>
                            <StageNumber stage={stage} />
                            <StageCaption stage={stage} />
                        </>
                    )}
                </div>
                {!artFirst && <StageArt stage={stage} />}
            </figure>
        </div>
    );
}

export default function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            aria-labelledby="how-it-works-title"
            className="w-full bg-paper px-4 pt-28 md:px-8 md:pt-44"
        >
            <div className="mx-auto max-w-page">
                <SectionHeader
                    label="How it works"
                    titleId="how-it-works-title"
                    title="One issue in. One tested pull request out."
                    description="Darwin takes the issue from your board, fixes it where your code really runs and comes back with something you can merge. Nothing ships until a person approves it."
                />

                <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-3 md:gap-8">
                    {STAGES.map((stage, index) => (
                        <StageTicket key={stage.number} stage={stage} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
