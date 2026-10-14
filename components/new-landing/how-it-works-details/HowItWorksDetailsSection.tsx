"use client";

import { useInView } from "motion/react";
import { type ComponentType, useEffect, useRef, useState } from "react";

import { CtaArrowIcon } from "@/components/icons";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import { cn } from "@/lib/utils";

import AgentQuestionExample from "./AgentQuestionExample";
import CreateIssueDemo from "./create-issue-demo/CreateIssueDemo";
import ExecutionModeScene from "./ExecutionModeScene";
import { HOW_IT_WORKS_TOPICS, type HowItWorksTopic } from "./howItWorksTopics";
import MosaicStage from "./MosaicStage";
import ProductDiffScene from "./ProductDiffScene";

const TOPIC_MEDIA: Partial<Record<string, ComponentType>> = {
    "file-an-issue": CreateIssueDemo,
    "auto-pilot-or-supervised": ExecutionModeScene,
    "ui-changes-and-figma": ProductDiffScene,
};

const TOPIC_EXAMPLE: Partial<Record<string, ComponentType>> = {
    "auto-pilot-or-supervised": AgentQuestionExample,
};

function TopicBlock({
    topic,
    index,
    onActive,
}: {
    topic: HowItWorksTopic;
    index: number;
    onActive: (index: number) => void;
}) {
    const ref = useRef<HTMLElement>(null);
    const centered = useInView(ref, { margin: "-40% 0px -55% 0px" });
    const Media = TOPIC_MEDIA[topic.id];
    const Example = TOPIC_EXAMPLE[topic.id];

    useEffect(() => {
        if (centered) onActive(index);
    }, [centered, index, onActive]);

    return (
        <article
            ref={ref}
            id={topic.id}
            className="scroll-mt-[calc(2.75rem+2rem)] overflow-hidden rounded-lg border border-edge bg-snow"
        >
            {Media && (
                <MosaicStage>
                    <Media />
                </MosaicStage>
            )}
            <h2 className="max-w-[32ch] px-6 pt-10 pb-6 text-[34px] leading-[1.08] font-medium tracking-[-0.03em] text-balance text-foreground sm:text-[40px] md:px-12 lg:text-[44px]">
                {topic.headline}
            </h2>
            <div
                className={cn(
                    "grid gap-10 px-6 pb-14 md:px-12",
                    Example && "lg:grid-cols-2 lg:items-start",
                )}
            >
                <div className="flex flex-col gap-4 text-[14.5px] leading-[1.7] text-foreground/75">
                    {topic.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="max-w-[62ch]">
                            {paragraph}
                        </p>
                    ))}
                    <div className="mt-4 max-w-[62ch] border-l-2 border-edge pl-4">
                        <p className={MONO_LABEL}>Credits</p>
                        <p className="mt-1.5 text-[13.5px] leading-[1.6]">{topic.credits}</p>
                    </div>
                </div>
                {Example && <Example />}
            </div>
        </article>
    );
}

export default function HowItWorksDetailsSection() {
    const [active, setActive] = useState(0);

    return (
        <section className="grid w-full border-b border-edge bg-ink lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <aside className="hidden lg:block">
                <nav
                    aria-label="How it works topics"
                    className="sticky top-[calc(2.75rem+2rem)] m-8 overflow-hidden rounded-lg border border-edge"
                >
                    {HOW_IT_WORKS_TOPICS.map((topic, index) => (
                        <a
                            key={topic.id}
                            href={`#${topic.id}`}
                            aria-current={index === active ? "true" : undefined}
                            className={cn(
                                "flex h-14 items-center justify-between border-b border-edge px-5 text-[15px] transition-colors last:border-b-0 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
                                index === active ? "text-foreground" : "text-neutral-500",
                            )}
                        >
                            {topic.nav}
                            {index === active && <CtaArrowIcon aria-hidden className="size-4" />}
                        </a>
                    ))}
                </nav>
            </aside>

            <div className="flex flex-col gap-8 px-3 py-6 md:p-8 lg:border-l lg:border-edge">
                {HOW_IT_WORKS_TOPICS.map((topic, index) => (
                    <TopicBlock key={topic.id} topic={topic} index={index} onActive={setActive} />
                ))}
            </div>
        </section>
    );
}
