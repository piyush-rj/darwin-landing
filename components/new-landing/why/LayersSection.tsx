"use client";

import { useInView } from "motion/react";
import { type ComponentType, useEffect, useRef, useState } from "react";

import { CtaArrowIcon } from "@/components/icons";
import MosaicStage from "@/components/new-landing/how-it-works-details/MosaicStage";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";
import { cn } from "@/lib/utils";

import BoardScene from "./layer-scenes/BoardScene";
import ProofScene from "./layer-scenes/ProofScene";
import ReviewScene from "./layer-scenes/ReviewScene";
import RunnerScene from "./layer-scenes/RunnerScene";

type Layer = {
    id: string;
    nav: string;
    headline: string;
    detail: string;
};

const LAYERS: Layer[] = [
    {
        id: "layer-board",
        nav: "Board",
        headline: "Issues land on the board. Darwin claims them the moment they arrive.",
        detail: "Issues land on Darwin's board from the app, from GitHub Issues or straight from Claude. Darwin claims them the moment they arrive.",
    },
    {
        id: "layer-runner",
        nav: "Runner",
        headline: "Every issue gets its own sandbox on a fresh branch.",
        detail: "Every issue gets its own sandbox with your repo on a fresh branch. When Darwin needs an answer it asks in Slack, Telegram or Discord, and the sandbox pauses for free while it waits.",
    },
    {
        id: "layer-proof",
        nav: "Proof",
        headline: "Bugs get a failing test first. The fix has to beat it.",
        detail: "Darwin runs the failing test on the old code, where it must fail, and on the fix, where it must pass. UI changes render side by side before you look.",
    },
    {
        id: "layer-review",
        nav: "Review",
        headline: "A pull request with the proof attached.",
        detail: "Review it in Darwin, send it back with a note, or merge it as yourself.",
    },
];

const LAYER_MEDIA: Record<string, ComponentType> = {
    "layer-board": BoardScene,
    "layer-runner": RunnerScene,
    "layer-proof": ProofScene,
    "layer-review": ReviewScene,
};

function LayerBlock({
    layer,
    index,
    onActive,
}: {
    layer: Layer;
    index: number;
    onActive: (index: number) => void;
}) {
    const ref = useRef<HTMLElement>(null);
    const centered = useInView(ref, { margin: "-40% 0px -55% 0px" });
    const Media = LAYER_MEDIA[layer.id];

    useEffect(() => {
        if (centered) onActive(index);
    }, [centered, index, onActive]);

    return (
        <article
            ref={ref}
            id={layer.id}
            className="scroll-mt-[calc(2.75rem+2rem)] overflow-hidden rounded-lg border border-edge bg-snow"
        >
            <MosaicStage>
                <Media />
            </MosaicStage>
            <h3 className="max-w-[32ch] px-6 pt-10 pb-6 text-[34px] leading-[1.08] font-medium tracking-[-0.03em] text-balance text-foreground sm:text-[40px] md:px-12 lg:text-[44px]">
                {layer.headline}
            </h3>
            <p className="max-w-[62ch] px-6 pb-14 text-[14.5px] leading-[1.7] text-foreground/75 md:px-12">
                {layer.detail}
            </p>
        </article>
    );
}

export default function LayersSection() {
    const [active, setActive] = useState(0);

    return (
        <section id="layers" className="w-full border-b border-edge bg-ink">
            <div className="px-6 pt-20 pb-12 md:px-9 lg:pt-28 lg:pb-16">
                <p className={MONO_LABEL}>How it holds up</p>
                <h2 className="mt-5 max-w-[18ch] text-[40px] leading-[1] font-normal tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                    <RollingText text="Darwin does the whole job, in four layers." />
                </h2>
            </div>

            <div className="grid w-full border-t border-edge lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                <aside className="hidden lg:block">
                    <nav
                        aria-label="The four layers"
                        className="sticky top-[calc(2.75rem+2rem)] m-8 overflow-hidden rounded-lg border border-edge"
                    >
                        {LAYERS.map((layer, index) => (
                            <a
                                key={layer.id}
                                href={`#${layer.id}`}
                                aria-current={index === active ? "true" : undefined}
                                className={cn(
                                    "flex h-14 items-center justify-between border-b border-edge px-5 text-[15px] transition-colors last:border-b-0 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
                                    index === active ? "text-foreground" : "text-neutral-500",
                                )}
                            >
                                {layer.nav}
                                {index === active && (
                                    <CtaArrowIcon aria-hidden className="size-4" />
                                )}
                            </a>
                        ))}
                    </nav>
                </aside>

                <div className="flex flex-col gap-8 px-3 py-6 md:p-8 lg:border-l lg:border-edge">
                    {LAYERS.map((layer, index) => (
                        <LayerBlock
                            key={layer.id}
                            layer={layer}
                            index={index}
                            onActive={setActive}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
