import Image from "next/image";
import type { CSSProperties } from "react";

import { CtaArrowIcon } from "@/components/icons";
import { HARD_SHADOW } from "@/components/new-landing/boxStyles";
import FadeIn from "@/components/new-landing/FadeIn";
import StatusBlock from "@/components/new-landing/StatusBlock";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { TEAM_CHAPTERS, type TeamChapter } from "./teamChapters";

const FOUNDER_STATUS = KanbanStatus.InProgress;

const issueId = (index: number) => `DRW-${String(index + 1).padStart(3, "0")}`;

function FounderHead({ chapter }: { chapter: TeamChapter }) {
    return <Image src={chapter.head} alt="" sizes="112px" className="size-14 shrink-0" />;
}

function FounderCard({ chapter, index }: { chapter: TeamChapter; index: number }) {
    return (
        <div
            style={{ "--tone": chapter.tone } as CSSProperties}
            className={cn("w-full border border-(--tone) bg-snow", HARD_SHADOW)}
        >
            <div className="flex items-center justify-between gap-3 border-b border-foreground/10 px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-neutral-500">
                {issueId(index)}
                <span className="flex items-center gap-1.5 text-foreground/80">
                    <StatusBlock status={FOUNDER_STATUS} />
                    {KanbanBoard.columnFor(FOUNDER_STATUS)!.title}
                </span>
            </div>
            <div className="px-4 pt-4 pb-5">
                <p className="text-[19px] leading-[1.3] tracking-[-0.01em] text-foreground">
                    {chapter.role}
                </p>
                <ul className="mt-4 flex flex-col gap-2 border-l border-(--tone) pl-3">
                    {chapter.facts.map((fact) => (
                        <li
                            key={fact}
                            className="text-[14px] leading-snug text-foreground/75 first-letter:uppercase"
                        >
                            {fact}
                        </li>
                    ))}
                </ul>
            </div>
            <a
                href={`https://x.com/${chapter.xHandle}`}
                target="_blank"
                rel="noreferrer"
                className="group/handle flex items-center justify-between border-t border-foreground/10 px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-neutral-500 transition-colors hover:text-foreground"
            >
                @{chapter.xHandle}
                <CtaArrowIcon className="size-3.5 transition-transform group-hover/handle:translate-x-0.5" />
            </a>
        </div>
    );
}

export default function TeamStory() {
    return (
        <div className="bg-ink">
            {TEAM_CHAPTERS.map((chapter, index) => (
                <section
                    key={chapter.key}
                    aria-label={`${chapter.name}, ${chapter.role}`}
                    className="grid grid-cols-1 border-b border-edge lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]"
                >
                    <div className="px-6 py-14 md:px-9 lg:py-20">
                        <FadeIn y={8} className="flex items-center gap-4">
                            <FounderHead chapter={chapter} />
                            <h2 className="text-[30px] leading-none font-medium tracking-[-0.03em] text-foreground">
                                {chapter.name}
                            </h2>
                        </FadeIn>
                        <FadeIn delay={0.1} y={8} className="mt-6">
                            <p className="max-w-[44ch] text-[22px] leading-[1.4] tracking-[-0.015em] text-foreground lg:text-[26px]">
                                {chapter.about}
                            </p>
                        </FadeIn>
                    </div>
                    <div className="flex items-center border-edge bg-mist px-6 py-10 max-lg:border-t md:px-9 lg:border-l lg:py-20">
                        <FadeIn delay={0.15} y={12} className="w-full">
                            <FounderCard chapter={chapter} index={index} />
                        </FadeIn>
                    </div>
                </section>
            ))}
        </div>
    );
}
